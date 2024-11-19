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

const SettlingTable = () => {
    const [settlings, setSettling] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentSettling, setCurrentSettling] = useState({});
    
    // Состояние для фильтров
    const [filters, setFilters] = useState({
        bookingNumber: '',
        serviceName: '',
    });

    useEffect(() => {
        fetchSettling();
    }, []);

    const fetchSettling = async () => {
        try {
            const response = await axios.get('http://localhost:5000/settling');
            setSettling(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, settling = {}) => {
        setDialogMode(mode);
        setCurrentSettling(settling);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentSettling({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/settling', currentSettling);
            } else {
                await axios.put(`http://localhost:5000/settling/${currentSettling.BookingNumber}`, currentSettling);
            }
            fetchSettling();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (bookingNumber) => {
        try {
            await axios.delete(`http://localhost:5000/settling/${bookingNumber}`);
            fetchSettling();
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
        setCurrentSettling((prev) => ({ ...prev, [name]: value }));
    };

    // Обработчик изменения фильтров
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Фильтрация данных
    const filteredSettling = settlings.filter((settling) => {
        return (
            (filters.bookingNumber === '' || settling.BookingNumber.toString().includes(filters.bookingNumber)) &&
            (filters.serviceName === '' || settling.ServiceName.toLowerCase().includes(filters.serviceName.toLowerCase()))
        );
    });

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Заселений
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    name="bookingNumber"
                    label="Фильтр по Номеру Бронирования"
                    variant="outlined"
                    value={filters.bookingNumber}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                />
                <TextField
                    name="serviceName"
                    label="Фильтр по Названию Услуги"
                    variant="outlined"
                    value={filters.serviceName}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Заселение
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Номер Бронирования</TableCell>
                        <TableCell>Дата Поселения</TableCell>
                        <TableCell>Дата Выезда</TableCell>
                        <TableCell>Название Услуги</TableCell>
                        <TableCell>ID Номера</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredSettling.map((settling) => (
                        <TableRow key={settling.BookingNumber}>
                            <TableCell>{settling.BookingNumber}</TableCell>
                            <TableCell>{new Date(settling.SettlingDate).toLocaleString()}</TableCell>
                            <TableCell>{new Date(settling.OutDate).toLocaleString()}</TableCell>
                            <TableCell>{settling.ServiceName}</TableCell>
                            <TableCell>{settling.RoomID}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', settling)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(settling.BookingNumber)}>
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

            {/* Диалоговое окно для создания/редактирования поселения */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Заселение' : 'Редактировать Заселение'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о поселении.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="SettlingDate"
                        label="Дата Поселения"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={currentSettling.SettlingDate ? new Date(currentSettling.SettlingDate).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="OutDate"
                        label="Дата Выезда"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={currentSettling.OutDate ? new Date(currentSettling.OutDate).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="ServiceName"
                        label="Название Услуги"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentSettling.ServiceName || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="RoomID"
                        label="ID Номера"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentSettling.RoomID || ''}
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

export default SettlingTable;

