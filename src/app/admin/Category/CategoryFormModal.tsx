"use client";
import React, { useState } from "react";
import { Button, Modal, Box, TextField, Typography, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: { _id?: string; name?: string };
}

export default function CategoryFormModal({ open, onClose, onSuccess, initialData }: CategoryFormModalProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        setName(initialData?.name || "");
        setError("");
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/tribe/category/addOrUpdate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(initialData?._id ? { _id: initialData._id, name } : { name }),
            });
            const data = await res.json();
            if (data.success || data.status === true) {
                onSuccess();
                onClose();
            } else {
                setError(data.message || "Failed to save category");
            }
        } catch (err) {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    minWidth: 320,
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" mb={2} sx={{ pr: 4, textTransform: 'none', fontWeight: 600, letterSpacing: 0 }}>
                    {initialData?._id ? "Edit Category" : "Add Category"}
                </Typography>
                <TextField
                    label="Category Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                />
                {error && <Typography color="error" mb={2}>{error}</Typography>}
                <Box mt={2} display="flex" gap={2}>
                   <Button
  onClick={onClose}
  disabled={loading}
  variant="outlined"
  fullWidth
  sx={{
    textTransform: 'none',
    color: '#6b7280',          // text color (gray)
    borderColor: '#6b7280',    // border color
    '&:hover': {
      borderColor: '#4b5563',
      backgroundColor: 'rgba(107,114,128,0.08)',
    },
  }}
>
  Cancel
</Button>


                    <Button
                        type="submit"
                        disabled={loading || !name.trim()}
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ textTransform: 'none' }}   // ✅ remove uppercase
                    >
                        {loading ? "Saving..." : (initialData?._id ? "Update" : "Add")}
                    </Button>
                </Box>

            </Box>
        </Modal>
    );
}
