export default function GestorTable({ gestores, handleEdit, handleDelete }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 text-center">
        Lista de Gestores
      </h2>
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">Apellidos</th>
            <th className="py-2 px-4">Correo</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gestores.map((g) => (
            <tr key={g.idUsuario} className="border-t hover:bg-slate-50">
              <td className="py-2 px-4">{g.nombre}</td>
              <td className="py-2 px-4">{g.apellidos}</td>
              <td className="py-2 px-4">{g.correo}</td>
              <td className="py-2 px-4 flex gap-2 justify-center">
                <button
                  onClick={() => handleEdit(g)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition w-20"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(g.idUsuario)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition w-20"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
