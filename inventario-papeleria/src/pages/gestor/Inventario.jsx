import { useState, useEffect } from "react";
import InventarioGeneral from "../../components/inventario/InventarioGeneral";
import InventarioParcial from "../../components/inventario/InventarioParcial";
import ReporteInventario from "../../components/inventario/ReporteInventario";
import { createInventario, finalizarInventario, getInventarios } from "../../services/inventarioService";
import { toast } from "react-toastify";
import {ClipboardList} from "lucide-react";

export default function Inventario({ idUsuarioGestor }) {
  const [pantalla, setPantalla] = useState("inicio");
  const [tipo, setTipo] = useState("");
  const [inventario, setInventario] = useState(null);
  const [listaInventarios, setListaInventarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const iniciarInventario = async (tipoSeleccionado) => {
    try {
      const nuevo = await createInventario({ tipo: tipoSeleccionado });
      setInventario(nuevo);
      setTipo(tipoSeleccionado);
      setPantalla(tipoSeleccionado);
      toast.success("Inventario iniciado correctamente");
    } catch {
      toast.error("Error al iniciar inventario");
    }
  };

  const finalizar = async () => {
    try {
      await finalizarInventario(inventario.idInventario);
      toast.success("Inventario finalizado");
      setPantalla("reporte");
    } catch {
      toast.error("Error al finalizar inventario");
    }
  };

  const pausarinventario = () => {
    setInventario(null);
    setTipo("");
    setPantalla("inicio");
    toast.info("Inventario pausado");
  };

  const continuarInventario = (inv) => {
    setInventario(inv);
    setTipo(inv.tipo);
    setPantalla(inv.tipo);
    toast.info("Continuando inventario en progreso");
  };

  const cargarListaInventarios = async () => {
    try {
      setLoading(true);
      const data = await getInventarios();
      setListaInventarios(data);
    } catch {
      toast.error("Error al cargar la lista de inventarios");
    } finally {
      setLoading(false);
    }
  };

  const volverInicio = () => {
    setInventario(null);
    setTipo("");
    setPantalla("inicio");
  };

  useEffect(() => {
    if (pantalla === "inicio") {
      cargarListaInventarios();
    }
  }, [pantalla]);

  if (pantalla === "reporte")
    return <ReporteInventario idInventario={inventario.idInventario} onVolver={volverInicio} />;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Título */}
      {!inventario && (
        <>
          <h1 className="text-3xl font-semibold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-blue-600"/>
            Gestión de Inventarios Físicos
          </h1>

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <button
              onClick={() => iniciarInventario("general")}
              className="w-full sm:w-auto px-6 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Inventario General
            </button>
            <button
              onClick={() => iniciarInventario("parcial")}
              className="w-full sm:w-auto px-6 py-4 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition-colors shadow-md"
            >
              Inventario Parcial
            </button>
          </div>

          {/* Lista de inventarios (siempre visible debajo) */}
          {/* Lista de inventarios (siempre visible debajo) */}
          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Historial de Inventarios</h3>

            {loading ? (
              <div className="p-6 text-center text-gray-500 animate-pulse">Cargando inventarios...</div>
            ) : listaInventarios.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No hay inventarios registrados.</div>
            ) : (
              <>
                {/* Tabla visible solo en pantallas grandes */}
                <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
                  <table className="min-w-full text-sm sm:text-base">
                    <thead className="bg-gray-100 text-gray-700 uppercase">
                      <tr>
                        <th className="py-3 px-3">ID</th>
                        <th className="py-3 px-3">Tipo</th>
                        <th className="py-3 px-3">Estado</th>
                        <th className="py-3 px-3">Inicio</th>
                        <th className="py-3 px-3">Fin</th>
                        <th className="py-3 px-3">Diferencias</th>
                        <th className="py-3 px-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaInventarios.map((inv) => (
                        <tr
                          key={inv.idInventario}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="py-2 px-3">{inv.idInventario}</td>
                          <td className="py-2 px-3 capitalize">{inv.tipo}</td>
                          <td
                            className={`py-2 px-3 font-semibold ${inv.estado === "Finalizado"
                              ? "text-green-600"
                              : inv.estado === "En progreso"
                                ? "text-yellow-600"
                                : "text-gray-600"
                              }`}
                          >
                            {inv.estado}
                          </td>
                          <td className="py-2 px-3">{new Date(inv.fechaInicio).toLocaleString("es-CO")}</td>
                          <td className="py-2 px-3">
                            {inv.fechaFin ? new Date(inv.fechaFin).toLocaleString("es-CO") : "-"}
                          </td>
                          <td className="py-2 px-3">{inv.cantDiferencias}</td>
                          <td className="py-2 px-3 flex justify-center gap-2 flex-wrap">
                            {inv.estado === "En progreso" ? (
                              <button
                                onClick={() => continuarInventario(inv)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                              >
                                Continuar
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setInventario(inv);
                                  setPantalla("reporte");
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                Ver Reporte
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tarjetitas (solo móviles) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                  {listaInventarios.map((inv) => (
                    <div
                      key={inv.idInventario}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition"
                    >
                      {/* Encabezado con badge */}
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">
                          Inventario #{inv.idInventario}
                        </h4>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${inv.tipo === "general"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                            }`}
                        >
                          {inv.tipo === "general" ? "General" : "Parcial"}
                        </span>
                      </div>

                      {/* Información */}
                      <div className="space-y-1 text-gray-700">
                        <p
                          className={`font-semibold ${inv.estado === "Finalizado"
                              ? "text-green-600"
                              : inv.estado === "En progreso"
                                ? "text-yellow-600"
                                : "text-gray-600"
                            }`}
                        >
                          Estado: {inv.estado}
                        </p>
                        <p>
                          <span className="font-medium">Inicio:</span>{" "}
                          {new Date(inv.fechaInicio).toLocaleString("es-CO")}
                        </p>
                        <p>
                          <span className="font-medium">Fin:</span>{" "}
                          {inv.fechaFin
                            ? new Date(inv.fechaFin).toLocaleString("es-CO")
                            : "-"}
                        </p>
                        <p>
                          <span className="font-medium">Diferencias:</span>{" "}
                          {inv.cantDiferencias}
                        </p>
                      </div>

                      {/* Botones */}
                      <div className="mt-4 flex justify-end">
                        {inv.estado === "En progreso" ? (
                          <button
                            onClick={() => continuarInventario(inv)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition w-full sm:w-auto"
                          >
                            Continuar
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setInventario(inv);
                              setPantalla("reporte");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
                          >
                            Ver Reporte
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </>
            )}
          </div>

        </>
      )}

      {/* Inventario General */}
      {pantalla === "general" && (
        <>
          <InventarioGeneral idInventario={inventario.idInventario} idUsuarioGestor={idUsuarioGestor} onFinalizar={finalizar} />
          <div className="mt-4 text-center">
            <button
              onClick={pausarinventario}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Pausar Inventario
            </button>
          </div>
        </>
      )}

      {/* Inventario Parcial */}
      {pantalla === "parcial" && (
        <>
          <InventarioParcial idInventario={inventario.idInventario} idUsuarioGestor={idUsuarioGestor} onFinalizar={finalizar} />
          <div className="mt-4 text-center">
            <button
              onClick={pausarinventario}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Pausar Inventario
            </button>
          </div>
        </>
      )}
    </div>
  );
}
