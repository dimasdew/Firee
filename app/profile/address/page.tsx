"use client";

import { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { MapPin, Plus, Check, Pencil, Trash2, Home, Building2 } from "lucide-react";

interface Address {
  id: string;
  label: string;
  type: "home" | "office";
  recipient: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    type: "home",
    recipient: "Dimas Dewantara",
    phone: "+62 812 3456 7890",
    street: "Jl. Sudirman No. 123, Block A",
    city: "Jakarta",
    state: "DKI Jakarta",
    zip: "10220",
    country: "Indonesia",
    isDefault: true,
  },
];

const EMPTY: Omit<Address, "id"> = {
  label: "",
  type: "home",
  recipient: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  isDefault: false,
};

export default function AddressPage() {
  const { showToast } = useApp();
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm(EMPTY);
  };

  const startEdit = (addr: Address) => {
    setEditing(addr.id);
    setAdding(false);
    setForm(addr);
  };

  const cancel = () => {
    setAdding(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const saveAddress = () => {
    if (!form.recipient || !form.street || !form.city) {
      showToast("Please fill in required fields");
      return;
    }

    if (adding) {
      const newAddr: Address = {
        ...form,
        id: `addr-${Date.now()}`,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      showToast("Address added!");
    } else if (editing) {
      setAddresses((prev) => prev.map((a) => (a.id === editing ? { ...form, id: editing } as Address : a)));
      showToast("Address updated!");
    }
    cancel();
  };

  const remove = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    showToast("Address removed");
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast("Default address updated");
  };

  const isFormOpen = adding || editing;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>Shipping Addresses</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Manage your delivery addresses</p>
          </div>
          {!isFormOpen && (
            <button type="button" className="btn-primary" onClick={startAdd} style={{ padding: "8px 16px", fontSize: 12 }}>
              <Plus size={13} /> Add
            </button>
          )}
        </div>

        {addresses.length === 0 && !isFormOpen && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <MapPin size={36} color="var(--sky)" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>No addresses saved yet</p>
            <button type="button" className="btn-primary" onClick={startAdd} style={{ fontSize: 12 }}>
              <Plus size={13} /> Add Address
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {addresses.map((addr) =>
            editing === addr.id ? null : (
              <div key={addr.id} style={{ padding: 16, borderRadius: 10, border: `1px solid ${addr.isDefault ? "var(--sky)" : "var(--border)"}`, background: addr.isDefault ? "rgba(110,172,218,0.04)" : "transparent", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(110,172,218,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {addr.type === "office" ? <Building2 size={16} color="var(--sky)" /> : <Home size={16} color="var(--sky)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text, white)" }}>{addr.label || addr.type}</p>
                      {addr.isDefault && <span className="badge badge-sky" style={{ fontSize: 9 }}>Default</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text, white)", marginBottom: 2 }}>{addr.recipient}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{addr.phone}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{addr.street}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{addr.country}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  {!addr.isDefault && (
                    <button type="button" className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setDefault(addr.id)}>
                      <Check size={12} /> Set Default
                    </button>
                  )}
                  <button type="button" className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => startEdit(addr)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: "5px 10px", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                    onClick={() => remove(addr.id)}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text, white)", marginBottom: 4 }}>
            {adding ? "New Address" : "Edit Address"}
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
            {adding ? "Add a new shipping address" : "Update address details"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Label</label>
                <input className="input" placeholder="e.g. Home, Office" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "home" | "office" })}>
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Recipient Name *</label>
                <input className="input" placeholder="Full name" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="+1 234 567 890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Street Address *</label>
              <input className="input" placeholder="Street, building, apartment" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">City *</label>
                <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="label">State / Province</label>
                <input className="input" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <label className="label">ZIP Code</label>
                <input className="input" placeholder="12345" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={cancel} style={{ padding: "8px 20px", fontSize: 12 }}>Cancel</button>
              <button type="button" className="btn-primary" onClick={saveAddress} style={{ padding: "8px 20px", fontSize: 12 }}>
                <Check size={13} /> {adding ? "Add Address" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
