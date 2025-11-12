import { useState } from "react";
import TodosMovimientos from "../../components/trazabilidad/TodosMovimientos";
import ListaEntradas from "../../components/trazabilidad/ListaEntradas";
import ListaSalidas from "../../components/trazabilidad/ListaSalidas";
import ListaDevoluciones from "../../components/trazabilidad/ListaDevoluciones";
import { ScrollText, Upload, Download, CornerUpLeft } from "lucide-react";

export default function Trazabilidad() {
  const [vista, setVista] = useState("todos"); // todos | entradas | salidas | devoluciones

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <ScrollText className="text-blue-600" /> Trazabilidad
        </h2>

        {/* Menú de opciones */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setVista("todos")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              vista === "todos"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ScrollText size={18} /> Todos los movimientos
          </button>
          <button
            onClick={() => setVista("entradas")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              vista === "entradas"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Upload size={18} /> Entradas
          </button>
          <button
            onClick={() => setVista("salidas")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              vista === "salidas"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Download size={18} /> Salidas
          </button>
          <button
            onClick={() => setVista("devoluciones")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              vista === "devoluciones"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <CornerUpLeft size={18} /> Devoluciones
          </button>
        </div>

        {/* Renderizado condicional */}
        {vista === "todos" && <TodosMovimientos />}
        {vista === "entradas" && <ListaEntradas showGestor={false} />}
        {vista === "salidas" && <ListaSalidas rol="admin"showGestor={false}/>}
        {vista === "devoluciones" && <ListaDevoluciones rol="admin" showGestor={false}/>}
      </div>
    </div>
  );
}
