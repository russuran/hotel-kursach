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

const RoomsTable = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentRoom, setCurrentRoom] = useState({});
    const [filter, setFilter] = useState({ Type: '', State: '' });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/rooms');
            setRooms(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, room = {}) => {
        setDialogMode(mode);
        setCurrentRoom(room);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentRoom({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/rooms', currentRoom);
            } else {
                await axios.put(`http://localhost:5000/rooms/${currentRoom.RoomID}`, currentRoom);
            }
            fetchRooms();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (roomId) => {
        try {
            await axios.delete(`http://localhost:5000/rooms/${roomId}`);
            fetchRooms();
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
        setCurrentRoom((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация комнат по введенным критериям
    const filteredRooms = rooms.filter(room => {
        return (
            room.Type.toLowerCase().includes(filter.Type.toLowerCase()) &&
            room.State.toLowerCase().includes(filter.State.toLowerCase())
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Комнат
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="Тип"
                    variant="outlined"
                    name="Type"
                    value={filter.Type}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="Состояние"
                    variant="outlined"
                    name="State"
                    value={filter.State}
                    onChange={handleFilterChange}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Комнату
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Размер</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Состояние</TableCell>
                        <TableCell>Этаж</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredRooms.map((room) => (
                        <TableRow key={room.RoomID}>
                            <TableCell>{room.RoomID}</TableCell>
                            <TableCell>{room.Type}</TableCell>
                            <TableCell>{room.Size}</TableCell>
                            <TableCell>{room.Price}</TableCell>
                            <TableCell>{room.State}</TableCell>
                            <TableCell>{room.Floor}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', room)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(room.RoomID)}>
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

            {/* Диалоговое окно для создания/редактирования комнаты */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Комнату' : 'Редактировать Комнату'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о комнате.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="Type"
                        label="Тип"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentRoom.Type || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Size"
                        label="Размер (м²)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentRoom.Size || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Price"
                        label="Цена"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentRoom.Price || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="State"
                        label="Состояние"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentRoom.State || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Floor"
                        label="Этаж"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentRoom.Floor || ''}
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

export default RoomsTable;

