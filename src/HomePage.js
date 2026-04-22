import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tcts, setTcts] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
const [showCreate, setShowCreate] = useState(false);
  const fetchTCTs = async () => {
    const snapshot = await getDocs(collection(db, "tcts"));
    setTcts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const [search, setSearch] = useState("");
  const filteredTCTs = tcts
  .filter(tct =>
    tct.title.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => a.title.localeCompare(b.title));
  const createTCT = async () => {
    if (!title) return;

    const docRef = await addDoc(collection(db, "tcts"), {
      title,
      notes: "",
      items: [],
      createdAt: Date.now()
    });

    navigate(`/tct/${docRef.id}`);
  };

  useEffect(() => {
    fetchTCTs();
  }, []);

  return (
    <div>
      <h1>The How-To Archive</h1>

        <button onClick={() => setShowCreate(!showCreate)}>
        {showCreate ? "Cancel" : "+ New TCT"}
        </button>

        {showCreate && (
        <div style={{ marginTop: "10px" }}>
            <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="New TCT"
            />
            <button onClick={createTCT}>Create</button>
        </div>
        )}
        <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        style={{
            padding: "10px",
            width: "100%",
            maxWidth: "300px",
            borderRadius: "8px",
            border: "1px solid #ccc"
        }}
        />
        <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
        marginTop: "20px"
        }}>
        {filteredTCTs.map(tct => (
            <div
            key={tct.id}
            onClick={() => navigate(`/tct/${tct.id}`)}
            style={{
                padding: "20px",
                borderRadius: "12px",
                background: "#f0f4ff",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                transition: "0.2s"
            }}
            >
            <h3>{tct.title}</h3>
            </div>
        ))}
        </div>
    </div>
  );
}