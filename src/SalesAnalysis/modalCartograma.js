import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ModalCartograma = ({ isOpen, onClose, onExportExcel, jsonData }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
                content: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    transform: "translate(-50%, -50%)",
                    width: "400px",
                    padding: "20px",
                    borderRadius: "10px",
                },
            }}
        >
            <h2 style={{ textAlign: "center" }}>Export Data</h2>
            <p style={{ textAlign: "center" }}>
                Are you sure you want to export the data as an Excel file?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={onExportExcel}
                >
                    Export
                </button>
                <button
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
};

export default ModalCartograma;
