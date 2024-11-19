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

const CleaningScheduleTable = () => {
    const [cleaningSchedules, setCleaningSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentSchedule, setCurrentSchedule] = useState({});
    const [filter, setFilter] = useState({ CleaningState: '', RoomID: '', MaidID: '' });

    useEffect(() => {
        fetchCleaningSchedules();
    }, []);

    const fetchCleaningSchedules = async () => {
        try {
            const response = await axios.get('http://localhost:5000/cleaning-schedules');
            setCleaningSchedules(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, schedule = {}) => {
        setDialogMode(mode);
        setCurrentSchedule(schedule);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentSchedule({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/cleaning-schedules', currentSchedule);
            } else {
                await axios.put(`http://localhost:5000/cleaning-schedules/${currentSchedule.CleaningID}`, currentSchedule);
            }
            fetchCleaningSchedules();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (cleaningId) => {
        try {
            await axios.delete(`http://localhost:5000/cleaning-schedules/${cleaningId}`);
            fetchCleaningSchedules();
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
        setCurrentSchedule((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация расписания уборок
    const filteredSchedules = cleaningSchedules.filter(schedule => {
        return (
            (filter.CleaningState ? schedule.CleaningState.toLowerCase().includes(filter.CleaningState.toLowerCase()) : true) &&
            (filter.RoomID ? schedule.RoomID.toString() === filter.RoomID : true) &&
            (filter.MaidID ? schedule.MaidID.toString() === filter.MaidID : true)
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Расписание Уборок
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="Состояние Уборки"
                    variant="outlined"
                    name="CleaningState"
                    value={filter.CleaningState}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="ID Номера"
                    variant="outlined"
                    name="RoomID"
                    type="number"
                    value={filter.RoomID}
                    onChange={handleFilterChange}
                />
                                <TextField
                    label="ID Горничной"
                    variant="outlined"
                    name="MaidID"
                    type="number"
                    value={filter.MaidID}
                    onChange={handleFilterChange}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Уборку
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Состояние Уборки</TableCell>
                        <TableCell>Дата и Время</TableCell>
                        <TableCell>ID Номера</TableCell>
                        <TableCell>ID Горничной</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredSchedules.map((schedule) => (
                        <TableRow key={schedule.CleaningID}>
                            <TableCell>{schedule.CleaningID}</TableCell>
                            <TableCell>{schedule.CleaningState}</TableCell>
                            <TableCell>{new Date(schedule.DateTime).toLocaleString()}</TableCell>
                            <TableCell>{schedule.RoomID}</TableCell>
                            <TableCell>{schedule.MaidID}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', schedule)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(schedule.CleaningID)}>
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

            {/* Диалоговое окно для создания/редактирования расписания уборки */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Уборку' : 'Редактировать Уборку'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о расписании уборки.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="CleaningState"
                        label="Состояние Уборки"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentSchedule.CleaningState || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="DateTime"
                        label="Дата и Время"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={currentSchedule.DateTime ? new Date(currentSchedule.DateTime).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="RoomID"
                        label="ID Номера"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentSchedule.RoomID || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="MaidID"
                        label="ID Горничной"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentSchedule.MaidID || ''}
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

export default CleaningScheduleTable;

