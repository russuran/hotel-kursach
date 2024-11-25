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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';

const SettlingTable = () => {
    const [settlings, setSettling] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [currentSettling, setCurrentSettling] = useState({});
    
    const [filters, setFilters] = useState({
        bookingNumber: '',
        serviceName: '',
        roomID: '',
        settlingDateFrom: '',
        settlingDateTo: '',
        outDateFrom: '',
        outDateTo: '',
    });

    const [servicesList, setServicesList] = useState([]);
    const [roomsList, setRoomsList] = useState([]);

    useEffect(() => {
        fetchSettling();
        fetchServicesList();
        fetchRoomsList();
    }, []);

    const fetchSettling = async () => {
        try {
            const response = await axios.get('http://localhost:5000/settlings');
            setSettling(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchServicesList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/services_list');
            setServicesList(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const fetchRoomsList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/list_of_rooms');
            setRoomsList(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
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
                await axios.post('http://localhost:5000/settlings', currentSettling);
            } else {
                await axios.put(`http://localhost:5000/settlings/${currentSettling.BookingNumber}`, currentSettling);
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
            await axios.delete(`http://localhost:5000/settlings/${bookingNumber}`);
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const filteredSettling = settlings.filter((settling) => {
        const settlingDate = new Date(settling.SettlingDate);
        const outDate = new Date(settling.OutDate);
        const settlingDateFrom = filters.settlingDateFrom ? new Date(filters.settlingDateFrom) : null;
        const settlingDateTo = filters.settlingDateTo ? new Date(filters.settlingDateTo) : null;
        const outDateFrom = filters.outDateFrom ? new Date(filters.outDateFrom) : null;
        const outDateTo = filters.outDateTo ? new Date(filters.outDateTo) : null;

        return (
            (filters.bookingNumber === '' || settling.BookingNumber.toString().includes(filters.bookingNumber)) &&
            (filters.serviceName === '' || settling.ServiceName === filters.serviceName) &&
            (filters.roomID === '' || settling.RoomID.toString() === filters.roomID) &&
            (settlingDateFrom === null || settlingDate >= settlingDateFrom) &&
            (settlingDateTo === null || settlingDate <= settlingDateTo) &&
            (outDateFrom === null || outDate >= outDateFrom) &&
            (outDateTo === null || outDate <= outDateTo)
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
                    label="Номер бронирования"
                    variant="outlined"
                    value={filters.bookingNumber}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                />
                <FormControl variant="outlined" style={{ margin: '16px', minWidth: 120 }}>
                    <InputLabel>Услуга</InputLabel>
                    <Select
                        name="serviceName"
                        value={filters.serviceName}
                        onChange={handleFilterChange}
                        label="Услуга"
                    >
                        <MenuItem value="">
                            <em>Все</em>
                        </MenuItem>
                        {servicesList.map((service) => (
                            <MenuItem key={service.ServiceName} value={service.ServiceName}>
                                {service.ServiceName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" style={{ margin: '16px', minWidth: 120 }}>
                    <InputLabel>ID Номера</InputLabel>
                    <Select
                        name="roomID"
                        value={filters.roomID}
                        onChange={handleFilterChange}
                        label="ID Номера"
                    >
                        <MenuItem value="">
                            <em>Все</em>
                        </MenuItem>
                        {roomsList.map((room) => (
                            <MenuItem key={room.RoomName} value={room.RoomName}>
                                {room.RoomName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    name="settlingDateFrom"
                    label="Дата Въезда С"
                    type="date"
                    variant="outlined"
                    value={filters.settlingDateFrom}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    name="settlingDateTo"
                    label="Дата Въезда По"
                    type="date"
                    variant="outlined"
                    value={filters.settlingDateTo}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    name="outDateFrom"
                    label="Дата Выезда С"
                    type="date"
                    variant="outlined"
                    value={filters.outDateFrom}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    name="outDateTo"
                    label="Дата Выезда По"
                    type="date"
                    variant="outlined"
                    value={filters.outDateTo}
                    onChange={handleFilterChange}
                    style={{ margin: '16px' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <Button variant="outlined" onClick={() => handleOpenDialog('edit', settling)}>
                                        Редактировать
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDelete(settling.BookingNumber)}>
                                        Удалить
                                    </Button>
                                </div>
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
                    <FormControl fullWidth variant="outlined" style={{ margin: '16px 0' }}>
                        <InputLabel>Название Услуги</InputLabel>
                        <Select
                            name="ServiceName"
                            value={currentSettling.ServiceName || ''}
                            onChange={handleChange}
                            label="Название Услуги"
                        >
                            {servicesList.map((service) => (
                                <MenuItem key={service.ServiceName} value={service.ServiceName}>
                                    {service.ServiceName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth variant="outlined" style={{ margin: '16px 0' }}>
                        <InputLabel>ID Номера</InputLabel>
                        <Select
                            name="RoomID"
                            value={currentSettling.RoomID || ''}
                            onChange={handleChange}
                            label="ID Номера"
                        >
                            {roomsList.map((room) => (
                                <MenuItem key={room.RoomName} value={room.RoomName}>
                                    {room.RoomName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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


