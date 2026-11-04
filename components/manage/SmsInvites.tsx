"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, MessageSquareText, Plus, Trash2 } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { InputField, TextareaField } from "@/components/ui/InputField";
import Skeleton from "@/components/ui/Skeleton";
import { useWeddingStore } from "@/store/weddingStore";
import { buildSmsRecipients, type ManualRecipient } from "@/lib/smsRecipients";
import { containsLink, DEFAULT_SMS_TEMPLATE, formatPhMobile, normalizePhMobile, smsPrefix, SMS_MAX_LENGTH, SMS_PER_NUMBER } from "@/lib/smsMessage";
import type { SmsSendResponse, SmsStatusResponse } from "@/app/api/sms/invitations/route";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
}

type Status = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; data: SmsStatusResponse };

let rowSeq = 0;
const newRow = () => ({ key: `m${rowSeq++}`, name: "", phone: "" });

async function fetchStatus(weddingId: string): Promise<Status> {
  try {
    const res = await fetch(`/api/sms/invitations?weddingId=${encodeURIComponent(weddingId)}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "We couldn't load your texts.");
    return { kind: "ready", data: json as SmsStatusResponse };
  } catch (err) {
    return { kind: "error", message: err instanceof Error ? err.message : "We couldn't load your texts." };
  }
}

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/**
 * Text invitations (Premium). Each guest on the list gets their own invite
 * link; a number typed in by hand gets the link of the guest whose name it
 * matches, otherwise the website's open link. The preview runs the same
 * recipient rules the server uses (lib/smsRecipients), so what's shown is what's sent.
 */
export default function SmsInvites({ config }: Props) {
  const guests = useWeddingStore((s) => s.guests).filter((g) => g.weddingId === config.id);
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [template, setTemplate] = useState(DEFAULT_SMS_TEMPLATE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manual, setManual] = useState<(ManualRecipient & { key: string })[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ tone: "ok" | "error"; text: string; rejected?: SmsSendResponse["rejected"] } | null>(null);

  const load = useCallback(() => fetchStatus(config.id).then(setStatus), [config.id]);

  useEffect(() => {
    let cancelled = false;
    fetchStatus(config.id).then((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, [config.id]);

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window === "undefined" ? "" : window.location.origin)).replace(/\/+$/, "");
  const reachable = useMemo(
    () => guests.filter((g) => normalizePhMobile(g.phone)).sort((a, b) => a.name.localeCompare(b.name)),
    [guests]
  );
  const missingPhone = guests.length - reachable.length;

  const lastTexted = useMemo(() => {
    const map = new Map<string, string>();
    if (status.kind !== "ready") return map;
    for (const entry of status.data.log) {
      if (entry.guestId && entry.status !== "skipped" && !map.has(entry.guestId)) map.set(entry.guestId, entry.createdAt);
    }
    return map;
  }, [status]);

  const plan = useMemo(
    () =>
      buildSmsRecipients({
        config,
        origin,
        guests,
        guestIds: [...selected],
        manual: manual.filter((m) => m.name.trim() || m.phone.trim()),
        template,
      }),
    [config, origin, guests, selected, manual, template]
  );
  const credits = plan.recipients.reduce((sum, r) => sum + r.credits, 0);
  const hasForeignLink = containsLink(template);
  const couple = [config.partner1Name, config.partner2Name].map((n) => n?.trim()).filter(Boolean).join(" & ");
  const preview = plan.recipients[0];

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const notYetTexted = reachable.filter((g) => !lastTexted.has(g.id));

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/sms/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId: config.id,
          guestIds: [...selected],
          manual: manual.filter((m) => m.name.trim() || m.phone.trim()).map(({ name, phone }) => ({ name, phone })),
          template,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setResult({ tone: "error", text: json?.error ?? "We couldn't send your texts. Please try again." });
      } else {
        const r = json as SmsSendResponse;
        setResult({
          tone: r.queued > 0 ? "ok" : "error",
          text:
            r.queued > 0
              ? `${r.queued} ${r.queued === 1 ? "invitation is" : "invitations are"} on the way.`
              : "No texts were sent.",
          rejected: r.rejected,
        });
        if (r.queued > 0) {
          setSelected(new Set());
          setManual([]);
        }
      }
    } catch {
      setResult({ tone: "error", text: "We couldn't reach the server. Check your connection and try again." });
    } finally {
      setSending(false);
      setConfirming(false);
      void load();
    }
  };

  const panel = { background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" };
  const muted = { color: "var(--color-on-surface-variant)" };

  return (
    <section aria-labelledby="sms-title" className="space-y-6 pt-4" style={{ borderTop: "1px solid var(--color-outline)" }}>
      <div className="max-w-2xl space-y-2 pt-6">
        <h2 id="sms-title" className="headline-sm flex items-center gap-2" style={{ fontSize: "1.35rem" }}>
          <MessageSquareText size={18} aria-hidden style={{ color: "var(--color-primary)" }} />
          Text invitations
        </h2>
        <p className="text-[0.9375rem]" style={muted}>
          Send each guest their own invitation link by SMS. Guests on your list get their personal link; a number you
          type in gets the link of the guest whose name matches, or your website&apos;s link if there&apos;s no match.
        </p>
      </div>

      {status.kind === "loading" ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : status.kind === "error" ? (
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between" style={panel}>
          <p role="alert" className="text-sm" style={{ color: "var(--color-on-surface)" }}>{status.message}</p>
          <ButtonSecondary size="sm" onClick={() => void load()}>Try again</ButtonSecondary>
        </div>
      ) : (
        <>
          {!status.data.configured && (
            <p className="p-4 text-sm" style={{ ...panel, ...muted }}>
              Texting isn&apos;t switched on for this account yet. You can prepare your message now and send it once it is.
            </p>
          )}
          {config.status !== "published" && (
            <p className="p-4 text-sm" style={{ ...panel, ...muted }}>
              Publish your website first. The links in your texts open your website, so they only work once it&apos;s live.
            </p>
          )}

          {/* Message */}
          <div className="space-y-3 p-5" style={panel}>
            <TextareaField
              label="Message"
              id="sms-template"
              rows={3}
              maxLength={SMS_MAX_LENGTH}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
            {hasForeignLink && (
              <p role="alert" className="text-xs font-medium" style={{ color: "var(--color-error, #b3261e)" }}>
                Leave web addresses out of your message. Each guest&apos;s invitation link is added for you.
              </p>
            )}
            <p className="text-xs" style={muted}>
              Every text starts with &ldquo;{smsPrefix(couple)}&rdquo; so guests know who it&apos;s from.{" "}
              <code>{"{name}"}</code> becomes each guest&apos;s name and <code>{"{link}"}</code> their invitation link (added at the
              end if you leave it out). Texts are plain text, so accents and emoji are removed. Every 160 characters is one credit.
            </p>
            {preview && (
              <div className="space-y-1">
                <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>
                  Preview for {preview.name} · {preview.content.length} characters · {preview.credits}{" "}
                  {preview.credits === 1 ? "credit" : "credits"}
                </p>
                <p
                  className="whitespace-pre-wrap break-words p-3 text-sm"
                  style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)" }}
                >
                  {preview.content}
                </p>
              </div>
            )}
          </div>

          {/* Guests on the list */}
          <fieldset className="space-y-3 p-5" style={panel}>
            <legend className="sr-only">Guests to text</legend>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                From your guest list
                <span className="font-light" style={muted}> · {reachable.length} with a mobile number</span>
              </p>
              {reachable.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <ButtonSecondary size="sm" onClick={() => setSelected(new Set(notYetTexted.map((g) => g.id)))} disabled={notYetTexted.length === 0}>
                    Select not yet texted ({notYetTexted.length})
                  </ButtonSecondary>
                  <ButtonSecondary size="sm" onClick={() => setSelected(new Set(reachable.map((g) => g.id)))}>Select all</ButtonSecondary>
                  {selected.size > 0 && (
                    <ButtonSecondary size="sm" onClick={() => setSelected(new Set())}>Clear</ButtonSecondary>
                  )}
                </div>
              )}
            </div>
            {missingPhone > 0 && (
              <p className="text-xs" style={muted}>
                {missingPhone} {missingPhone === 1 ? "guest has" : "guests have"} no Philippine mobile number yet. Add one in the
                guest list (or a Mobile column in your CSV) to text them.
              </p>
            )}
            {reachable.length === 0 ? (
              <p className="py-4 text-sm" style={muted}>
                No guests have a mobile number yet. You can still type numbers in below.
              </p>
            ) : (
              <ul className="grid max-h-80 gap-x-6 overflow-y-auto sm:grid-cols-2">
                {reachable.map((g) => {
                  const texted = lastTexted.get(g.id);
                  return (
                    <li key={g.id}>
                      <label className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm" style={{ color: "var(--color-on-surface)" }}>
                        <input
                          type="checkbox"
                          checked={selected.has(g.id)}
                          onChange={() => toggle(g.id)}
                          style={{ accentColor: "var(--color-primary)" }}
                        />
                        <span className="min-w-0 flex-1 truncate">{g.name}</span>
                        <span className="shrink-0 text-xs" style={muted}>
                          {texted ? (
                            <span className="inline-flex items-center gap-1">
                              <Check size={12} aria-hidden /> Texted {dateLabel(texted)}
                            </span>
                          ) : (
                            formatPhMobile(normalizePhMobile(g.phone) ?? "")
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </fieldset>

          {/* Numbers typed in */}
          <div className="space-y-3 p-5" style={panel}>
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Someone not on the list</p>
            {manual.map((m, i) => {
              const match = plan.recipients.find((r) => r.recipient === normalizePhMobile(m.phone) && (r.linkKind === "personal" || r.name === m.name.trim()));
              return (
                <div key={m.key} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <InputField
                      label="Name"
                      id={`sms-name-${m.key}`}
                      value={m.name}
                      onChange={(e) => setManual((rows) => rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Mobile"
                      id={`sms-phone-${m.key}`}
                      type="tel"
                      inputMode="tel"
                      placeholder="0917 123 4567"
                      value={m.phone}
                      onChange={(e) => setManual((rows) => rows.map((r, j) => (j === i ? { ...r, phone: e.target.value } : r)))}
                    />
                  </div>
                  <p className="text-xs sm:w-40 sm:pb-3" style={muted} aria-live="polite">
                    {match ? (match.linkKind === "personal" ? "Gets their personal link" : "Gets your website link") : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => setManual((rows) => rows.filter((_, j) => j !== i))}
                    className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: "var(--color-on-surface-muted)" }}
                    aria-label={`Remove ${m.name.trim() || "this number"}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
            <ButtonSecondary size="sm" onClick={() => setManual((rows) => [...rows, newRow()])}>
              <Plus size={13} />
              Add a number
            </ButtonSecondary>
          </div>

          {/* Send */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm" style={muted}>
              <p>
                <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>{plan.recipients.length}</span>{" "}
                {plan.recipients.length === 1 ? "text" : "texts"} · {credits} {credits === 1 ? "credit" : "credits"}
              </p>
              <p className="text-xs">
                {status.data.used} of {status.data.allowance} credits used on this website · up to {SMS_PER_NUMBER} texts per number
              </p>
              {plan.rejected.length > 0 && (
                <p className="text-xs">
                  Can&apos;t text {plan.rejected.map((r) => `${r.name} (${r.reason.toLowerCase()})`).join(", ")}.
                </p>
              )}
            </div>
            {confirming ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm" style={{ color: "var(--color-on-surface)" }}>
                  Send {plan.recipients.length} {plan.recipients.length === 1 ? "text" : "texts"} now?
                </p>
                <ButtonSecondary size="sm" onClick={() => setConfirming(false)} disabled={sending}>Cancel</ButtonSecondary>
                <ButtonPrimary size="sm" onClick={() => void send()} disabled={sending} aria-busy={sending}>
                  {sending ? "Sending…" : "Yes, send"}
                </ButtonPrimary>
              </div>
            ) : (
              <ButtonPrimary
                size="md"
                onClick={() => setConfirming(true)}
                disabled={
                  plan.recipients.length === 0 ||
                  hasForeignLink ||
                  !status.data.configured ||
                  config.status !== "published" ||
                  credits > status.data.allowance - status.data.used
                }
              >
                <MessageSquareText size={14} />
                Send invitations
              </ButtonPrimary>
            )}
          </div>

          <div role="status" aria-live="polite" className="empty:hidden">
            {result && (
              <div className="space-y-1 p-4 text-sm" style={{ ...panel, color: "var(--color-on-surface)" }}>
                <p>{result.text}</p>
                {result.rejected && result.rejected.length > 0 && (
                  <ul className="list-disc pl-5 text-xs" style={muted}>
                    {result.rejected.map((r, i) => (
                      <li key={`${r.phone}-${i}`}>
                        {r.name}: {r.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
