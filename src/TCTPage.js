import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc,deleteDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";


export default function TCTPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tct, setTct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newItem, setNewItem] = useState("");
  const [showInput, setShowInput] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [notes, setNotes] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch TCT
  useEffect(() => {
    const fetchTCT = async () => {
      try {
        const docRef = doc(db, "tcts", id);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setError("TCT not found");
          setLoading(false);
          return;
        }

        const data = snap.data();
        setTct({ id: snap.id, ...data });
        setNotes(data.notes || "");
        setInitialized(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchTCT();
  }, [id]);

  // Auto-save notes (debounced)
  useEffect(() => {
    if (!initialized) return;

    setSaving(true);

    const timeout = setTimeout(async () => {
      try {
        const docRef = doc(db, "tcts", id);
        await updateDoc(docRef, { notes });
      } catch (err) {
        console.error("Save failed:", err);
      }
      setSaving(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [notes, initialized, id]);

  // Update helper
  const updateTCT = async (updatedFields) => {
    const docRef = doc(db, "tcts", id);
    await updateDoc(docRef, updatedFields);

    // update local state (no refetch needed)
    setTct(prev => ({ ...prev, ...updatedFields }));
  };

  // Checklist actions
  const addItem = async () => {
    if (!newItem.trim()) return;

    const updatedItems = [
      ...tct.items,
      { id: Date.now(), text: newItem, checked: false }
    ];

    await updateTCT({ items: updatedItems });
    setNewItem("");
  };

  const toggleItem = async (itemId) => {
    const updatedItems = tct.items.map(item =>
      item.id === itemId
        ? { ...item, checked: !item.checked }
        : item
    );

    await updateTCT({ items: updatedItems });
  };

  const deleteItem = async (itemId) => {
    const updatedItems = tct.items.filter(item => item.id !== itemId);
    await updateTCT({ items: updatedItems });
  };

  const saveEdit = async (itemId) => {
    const updatedItems = tct.items.map(item =>
      item.id === itemId ? { ...item, text: editingText } : item
    );

    await updateTCT({ items: updatedItems });
    setEditingId(null);
  };

  const resetChecklist = async () => {
    const updatedItems = tct.items.map(item => ({
      ...item,
      checked: false
    }));

    await updateTCT({ items: updatedItems });
  };
const deleteTCT = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this TCT? This cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    const docRef = doc(db, "tcts", id);
    await deleteDoc(docRef);

    navigate("/"); // go back home
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete. Try again.");
  }
};
  const moveItem = async (index, direction) => {
  const newItems = [...tct.items];
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= newItems.length) return;

  // swap
  [newItems[index], newItems[targetIndex]] = 
  [newItems[targetIndex], newItems[index]];

  await updateTCT({ items: newItems });
};

  // Loading / error states
  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;
  if (error) return <div style={{ padding: "20px" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/")}>← Home</button>
        <h2 style={{ marginTop: "10px" }}>{tct.title}</h2>
      </div>

      {/* Checklist Card */}
      <div style={{
        background: "#f9f9f9",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}>
        <h3>Checklist</h3>

        <button onClick={() => setShowInput(!showInput)}>
          {showInput ? "Cancel" : "+ Add Item"}
        </button>

        {showInput && (
          <div style={{ marginTop: "10px" }}>
            <input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="New item"
            />
            <button onClick={addItem}>Add</button>
          </div>
        )}

        <ul style={{ padding: 0, marginTop: "15px" }}>
          {tct.items.map((item, index) => (
  <li key={item.id} style={{
    listStyle: "none",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }}>
    
    {/* Move buttons */}
<button disabled={index === 0} onClick={() => moveItem(index, -1)}>⬆️</button>
<button disabled={index === tct.items.length - 1} onClick={() => moveItem(index, 1)}>⬇️</button>

    <input
      type="checkbox"
      checked={item.checked}
      onChange={() => toggleItem(item.id)}
    />

    {editingId === item.id ? (
      <>
        <input
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
        />
        <button onClick={() => saveEdit(item.id)}>Save</button>
      </>
    ) : (
      <span style={{
        flex: 1,
        textDecoration: item.checked ? "line-through" : "none"
      }}>
        {item.text}
      </span>
    )}

    <button onClick={() => {
      setEditingId(item.id);
      setEditingText(item.text);
    }}>
      Edit
    </button>

    <button onClick={() => deleteItem(item.id)}>
      Delete
    </button>
  </li>
))}
        </ul>

        <button onClick={resetChecklist}>Reset</button>
      </div>

      {/* Notes Card */}
      <div style={{
        marginTop: "20px",
        background: "#f0f4ff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}>
        <h3>Notes</h3>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write notes, tips, reminders..."
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            resize: "vertical"
          }}
        />

        {saving && (
          <p style={{ fontSize: "12px", marginTop: "5px" }}>
            Saving...
          </p>
        )}
      </div>

      <div style={{ marginTop: "30px", textAlign: "center" }}>
  <button
    onClick={deleteTCT}
    style={{
      background: "#ff4d4f",
      color: "white",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer"
    }}
  >
    Delete This TCT
  </button>
</div>
    </div>
  );
}