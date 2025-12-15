import { PayPalButtons } from "@paypal/react-paypal-js";

export default function PayPalComponent() {
  return (
    <div>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: "0.01" } }],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert("Transaction completed by " + details.payer.name.given_name);
          });
        }}
      />
    </div>
  );
}
