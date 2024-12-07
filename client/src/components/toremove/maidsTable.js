import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Typography,
    Snackbar,
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material';

const MaidsTable = () => {
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentMaid, setCurrentMaid] = useState({});
    const [filter, setFilter] = useState({ FullName: '' });

    useEffect(() => {
        fetchMaids();
    }, []);

    const fetchMaids = async () => {
        try {
            const response = await axios.get('http://localhost:5000/maids');
            setMaids(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, maid = {}) => {
        setDialogMode(mode);
        setCurrentMaid(maid);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentMaid({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/maids', currentMaid);
            } else {
                await axios.put(`http://localhost:5000/maids/${currentMaid.MaidID}`, currentMaid);
            }
            fetchMaids();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (maidId) => {
        try {
            await axios.delete(`http://localhost:5000/maids/${maidId}`);
            fetchMaids();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentMaid((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация горничных по введенным критериям
    const filteredMaids = maids.filter(maid => {
        return maid.FullName.toLowerCase().includes(filter.FullName.toLowerCase());
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Горничных
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="ФИО"
                    variant="outlined"
                    name="FullName"
                    value={filter.FullName}
                    onChange={handleFilterChange}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Горничную
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>ФИО</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredMaids.map((maid) => (
                        <TableRow key={maid.MaidID}>
                            <TableCell>{maid.MaidID}</TableCell>
                            <TableCell>{maid.FullName}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', maid)}>
                                Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(maid.MaidID)}>
                                    Удалить
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            {/* Диалоговое окно для создания/редактирования уборщика */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Уборщика' : 'Редактировать Уборщика'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию об уборщике.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="FullName"
                        label="Полное имя"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentMaid.FullName || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="WorkerID"
                        label="ID Работника"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentMaid.WorkerID || ''}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        {dialogMode === 'create' ? 'Создать' : 'Сохранить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </TableContainer>
    );
};

export default MaidsTable;

