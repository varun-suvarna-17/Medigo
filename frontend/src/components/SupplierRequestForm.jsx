export default function SupplierRequestForm() {
  return (
    <form className="border rounded-lg p-4 space-y-2">
      <h2 className="font-semibold">New Supplier Request</h2>
      <input className="border p-2 w-full" placeholder="Medicine" disabled />
      <input className="border p-2 w-full" placeholder="Required Quantity" />
      <select className="border p-2 w-full">
        <option>Emergency Level: Low</option>
        <option>Emergency Level: Medium</option>
        <option>Emergency Level: High</option>
      </select>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
}
