"use client";

import { useState } from "react";

export default function PackageForm({ onSubmit, loading }) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [files, setFiles] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // client-side validation to match backend expectations
    if (!itemName || itemName.length < 2) return alert('Item name is required (min 2 chars)');
    if (!description || description.length < 10) return alert('Description is required (min 10 chars)');
    if (!receiverPhone || receiverPhone.length < 7) return alert('Receiver phone is required (min 7 chars)');
    if (!deliveryTime) return alert('Delivery time is required');

    const form = new FormData();
    form.append("itemName", itemName);
    form.append("description", description);
    form.append("receiverPhone", receiverPhone);
    form.append("deliveryTime", deliveryTime);
    if (files) {
      Array.from(files).forEach((file) => form.append("images", file));
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        className="input"
        placeholder="Item name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Receiver phone"
        value={receiverPhone}
        onChange={(e) => setReceiverPhone(e.target.value)}
      />
      <input
        className="input"
        placeholder="Delivery time"
        value={deliveryTime}
        onChange={(e) => setDeliveryTime(e.target.value)}
      />
      <textarea
        className="input"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      <button className="btn-primary mt-2" disabled={loading} type="submit">
        {loading ? "Saving..." : "Create"}
      </button>
    </form>
  );
}
