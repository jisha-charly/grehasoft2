import { useState } from "react";
import { createLead } from "@/services/crm.service";

interface Props {
  onSuccess: () => void;
}

const AddLeadModal: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await createLead(form);
      onSuccess();
      (window as any).bootstrap.Modal.getInstance(
        document.getElementById("addLeadModal")
      )?.hide();
    } catch (err) {
      console.error("Error creating lead", err);
    }
  };

  return (
    <div
      className="modal fade"
      id="addLeadModal"
      tabIndex={-1}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Lead</h5>
            <button className="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-3"
              placeholder="Name"
              name="name"
              onChange={handleChange}
            />
            <input
              className="form-control mb-3"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input
              className="form-control mb-3"
              placeholder="Phone"
              name="phone"
              onChange={handleChange}
            />
            <input
              className="form-control"
              placeholder="Source (Instagram, Website...)"
              name="source"
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Create Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;