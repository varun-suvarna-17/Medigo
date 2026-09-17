export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen">
      <form className="p-6 border rounded-lg space-y-3">
        <h1 className="text-lg font-bold">Login</h1>
        <input className="border p-2 w-full" placeholder="Username" />
        <input className="border p-2 w-full" type="password" placeholder="Password" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Login</button>
      </form>
    </div>
  );
}
