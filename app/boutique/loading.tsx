export default function BoutiqueLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement du catalogue...</p>
      </div>
    </div>
  );
}
