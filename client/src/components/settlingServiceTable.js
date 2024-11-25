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

const SettlingServiceTable = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentService, setCurrentService] = useState({ SettlingID: 0, Amount: 1 });
    const [filter, setFilter] = useState({ name: '', SettlingID: '', Amount: '' });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('http://localhost:5000/settling_services');
            setServices(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, service = {}) => {
        setDialogMode(mode);
        setCurrentService(service);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentService({ SettlingID: 0, Amount: 1 });
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/settling_services/', currentService);
            } else {
                await axios.put(`http://localhost:5000/settling_services/${currentService.SettlingID}`, currentService);
            }
            fetchServices();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (settlingID) => {
        try {
            await axios.delete(`http://localhost:5000/settling_services/${settlingID}`);
            fetchServices();
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
        setCurrentService((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация услуг по введенным критериям
    const filteredServices = services.filter(service => {
        return (
            service.name.toLowerCase().includes(filter.name.toLowerCase()) &&
            (filter.SettlingID ? service.SettlingID.toString() === filter.SettlingID : true) &&
            (filter.Amount ? service.Amount.toString() === filter.Amount : true)
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Услуг
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="Название"
                    variant="outlined"
                    name="name"
                    value={filter.name}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="SettlingID"
                    variant="outlined"
                    name="SettlingID"
                    type="number"
                    value={filter.SettlingID}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="Количество"
                    variant="outlined"
                    name="Amount"
                    type="number"
                    value={filter.Amount}
                                        onChange={handleFilterChange}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Услугу
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Услуга</TableCell>
                        <TableCell>SettlingID</TableCell>
                        <TableCell>Количество</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredServices.map((service) => (
                        <TableRow key={service.SettlingID}>
                            <TableCell>{service.name}</TableCell>
                            <TableCell>{service.SettlingID}</TableCell>
                            <TableCell>{service.Amount}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', service)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(service.SettlingID)}>
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

            {/* Диалоговое окно для создания/редактирования услуги */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Услугу' : 'Редактировать Услугу'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию об услуге.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Название"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentService.name || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="SettlingID"
                        label="SettlingID"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentService.SettlingID || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Amount"
                        label="Количество"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentService.Amount || ''}
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

export default SettlingServiceTable;

