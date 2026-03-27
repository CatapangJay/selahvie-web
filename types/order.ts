export interface Order {
  id: string;
  templateIds: string[];
  totalCents: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  email: string;
  name: string;
}
