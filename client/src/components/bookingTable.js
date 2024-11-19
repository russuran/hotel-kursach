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

const BookingTable = () => {
    // Начальные значения для фильтров
    const valid = { FullName: '', Phone: '', DateStart: '', DateEnd: '', RoomID: '' };
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' или 'edit'
    const [currentBooking, setCurrentBooking] = useState({});
    const [filter, setFilter] = useState(valid);

    useEffect(() => {
        fetchBookings();
    }, []);

    // Функция для получения списка бронирований
    const fetchBookings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/bookings');
            setBookings(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    // Открытие диалогового окна для создания или редактирования бронирования
    const handleOpenDialog = (mode, booking = {}) => {
        setDialogMode(mode);
        setCurrentBooking(booking);
        setOpenDialog(true);
    };

    // Закрытие диалогового окна
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentBooking({});
    };

    // Сохранение нового или отредактированного бронирования
    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/bookings', currentBooking);
            } else {
                await axios.put(`http://localhost:5000/bookings/${currentBooking.BookingID}`, currentBooking);
            }
            fetchBookings();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    // Удаление бронирования
    const handleDelete = async (bookingId) => {
        try {
            await axios.delete(`http://localhost:5000/bookings/${bookingId}`);
            fetchBookings();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    // Закрытие уведомления об ошибке
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // Обработка изменений в полях ввода
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentBooking((prev) => ({ ...prev, [name]: value }));
    };

    // Обработка изменений в фильтрах
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    // Если данные загружаются, показываем индикатор загрузки
    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация бронирований по введенным критериям
    const filteredBookings = bookings.filter(booking => {
        return (
            (booking.FullName && booking.FullName.toLowerCase().includes(filter.FullName.toLowerCase())) &&
            (booking.Phone && booking.Phone.toString().toLowerCase().includes(filter.Phone.toLowerCase())) &&
            (filter.DateStart ? new Date(booking.DateStart) >= new Date(filter.DateStart) : true) &&
            (filter.DateEnd ? new Date(booking.DateEnd) <= new Date(filter.DateEnd) : true) &&
            (filter.RoomID ? booking.RoomID.toString() === filter.RoomID : true)
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Бронирований
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="ФИО"
                    variant="outlined"
                    fullWidth
                    name="FullName"
                    value={filter.FullName}
                    onChange={handleFilterChange}
                    style={{ marginBottom: '16px' }}
                />
                <TextField
                    label="Номер Телефона"
                    variant="outlined"
                    fullWidth
                    name="Phone"
                    value={filter.Phone}
                    onChange={handleFilterChange}
                    style={{ marginBottom: '16px' }}
                />
                <TextField
                    label="Дата въезда"
                    variant="outlined"
                    fullWidth
                    name="DateStart"
                    type="date"
                    value={filter.DateStart}
                    onChange={handleFilterChange}
                    style={{ marginBottom: '16px' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Дата выезда"
                    variant="outlined"
                    fullWidth
                    name="DateEnd"
                    type="date"
                    value={filter.DateEnd}
                    onChange={handleFilterChange}
                    style={{ marginBottom: '16px' }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label="Комната"
                    variant="outlined"
                    fullWidth
                    name="RoomID"
                    value={filter.RoomID}
                    onChange={handleFilterChange}
                    style={{ marginBottom: '16px' }}
                />
            </div>
            
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Бронирование
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>ФИО</TableCell>
                        <TableCell>Номер Телефона</TableCell>
                        <TableCell>Дата Въезда</TableCell>
                        <TableCell>Дата Выезда</TableCell>
                        <TableCell>Комната</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredBookings.map((booking) => (
                        <TableRow key={booking.BookingID}>
                            <TableCell>{booking.BookingID}</TableCell>
                            <TableCell>{booking.FullName}</TableCell>
                            <TableCell>{booking.Phone}</TableCell>
                            <TableCell>{new Date(booking.DateStart).toLocaleString()}</TableCell>
                            <TableCell>{new Date(booking.DateEnd).toLocaleString()}</TableCell>
                            <TableCell>{booking.RoomID}</TableCell>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <Button variant="outlined" onClick={() => handleOpenDialog('edit', booking)}>
                                        Редактировать
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDelete(booking.BookingID)}>
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

            {/* Диалоговое окно для создания/редактирования бронирования */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Бронирование' : 'Редактировать Бронирование'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о бронировании.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="FullName"
                        label="Полное имя"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentBooking.FullName || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Phone"
                        label="Телефон"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentBooking.Phone || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="DateStart"
                        label="Дата начала"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={currentBooking.DateStart ? new Date(currentBooking.DateStart).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="DateEnd"
                        label="Дата окончания"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={currentBooking.DateEnd ? new Date(currentBooking.DateEnd).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="RoomID"
                        label="ID Номера"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentBooking.RoomID || ''}
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

export default BookingTable;


