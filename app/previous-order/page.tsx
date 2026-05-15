import { redirect } from "next/navigation";

export default function PreviousOrderRedirect() {
  redirect("/order/previous");
}
