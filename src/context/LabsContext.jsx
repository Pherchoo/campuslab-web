import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthState";
import { ownAssignment } from "../utils/domain";
import { LabsContext as Context } from "./LabsState";
export function LabsProvider({ children }) {
  const { request, session } = useAuth();
  const [computers, setComputers] = useState([]),
    [labs, setLabs] = useState([]),
    [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState("");
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++sequence.current;
    await Promise.resolve();
    if (version !== sequence.current) return;
    setRefreshing(true);
    setError("");
    try {
      const [pcs, rooms, active] = await Promise.all([
        request("/api/labs/computers"),
        request("/api/labs/computers/labs"),
        request("/api/labs/assignments?estatus=ASIGNADA"),
      ]);
      if (version !== sequence.current) return;
      setComputers(pcs);
      setLabs(rooms);
      setAssignments(active);
    } catch (e) {
      if (version === sequence.current) setError(e.message);
    } finally {
      if (version === sequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [request]);
  const invalidate = useCallback(() => {
    sequence.current++;
  }, []);
  useEffect(() => {
    let disposed = false;
    Promise.resolve().then(() => {
      if (!disposed) void refresh();
    });
    return () => {
      disposed = true;
      invalidate();
    };
  }, [refresh, invalidate]);
  const handleSelect = async (computerId, materia, horasUso) => {
    const result = await request("/api/labs/assignments", {
      method: "POST",
      body: JSON.stringify({
        computerId,
        materia: materia.trim(),
        horasUso: Number(horasUso),
      }),
    });
    setAssignments((list) => [...list, result]);
    setComputers((list) =>
      list.map((pc) =>
        pc.id === computerId ? { ...pc, estatus: "OCUPADA" } : pc,
      ),
    );
    void refresh();
    return result;
  };
  const handleRelease = async (
    assignmentId,
    reporteFalla,
    descripcionFalla,
  ) => {
    const result = await request(
      `/api/labs/assignments/${encodeURIComponent(assignmentId)}/release`,
      {
        method: "PATCH",
        body: JSON.stringify({
          reporteFalla,
          descripcionFalla: reporteFalla ? descripcionFalla.trim() : "",
        }),
      },
    );
    setAssignments((list) =>
      list.filter((a) => a.assignmentId !== assignmentId),
    );
    setComputers((list) =>
      list.map((pc) =>
        pc.id === result.computerId
          ? { ...pc, estatus: reporteFalla ? "MANTENIMIENTO" : "DISPONIBLE" }
          : pc,
      ),
    );
    void refresh();
    return result;
  };
  return (
    <Context.Provider
      value={{
        computers,
        labs,
        loading,
        refreshing,
        error,
        refresh,
        assign: handleSelect,
        release: handleRelease,
        active: ownAssignment(assignments, session.user.id),
      }}
    >
      {children}
    </Context.Provider>
  );
}
