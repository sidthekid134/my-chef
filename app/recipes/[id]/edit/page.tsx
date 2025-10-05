export default function EditRecipePage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
        <p className="text-gray-600">Recipe ID: {params.id}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p>Edit recipe functionality will be implemented in a future story.</p>
        <p className="mt-4 text-gray-500">You were redirected here after successfully creating a new recipe.</p>
      </div>
    </main>
  );
}