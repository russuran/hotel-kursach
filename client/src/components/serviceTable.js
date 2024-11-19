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

const ServiceTable = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentService, setCurrentService] = useState({});
    const [filter, setFilter] = useState({ name: '', Description: '', Price: '' });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('http://localhost:5000/services');
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
        setCurrentService({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/services', currentService);
            } else {
                await axios.put(`http://localhost:5000/services/${currentService.name}`, currentService);
            }
            fetchServices();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (serviceName) => {
        try {
            await axios.delete(`http://localhost:5000/services/${serviceName}`);
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
            service.Description.toLowerCase().includes(filter.Description.toLowerCase()) &&
            (filter.Price ? service.Price.toString() === filter.Price : true)
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
                    label="Описание"
                    variant="outlined"
                    name="Description"
                    value={filter.Description}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="Цена"
                    variant="outlined"
                    name="Price"
                    type="number"
                    value={filter.Price}
                    onChange={handleFilterChange}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
            Добавить Услугу
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredServices.map((service) => (
                        <TableRow key={service.name}>
                            <TableCell>{service.name}</TableCell>
                            <TableCell>{service.Description}</TableCell>
                            <TableCell>{service.Price}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', service)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(service.name)}>
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
                        name="Description"
                        label="Описание"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentService.Description || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Price"
                        label="Цена"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentService.Price || ''}
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

export default ServiceTable;

