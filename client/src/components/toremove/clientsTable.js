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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import MaskedInput from 'react-text-mask';

const ClientsTable = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentClient, setCurrentClient] = useState({});
    const [filter, setFilter] = useState({ FullName: '', Phone: '', Sex: '', Passport: '' });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/clients');
            setClients(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, client = {}) => {
        setDialogMode(mode);
        setCurrentClient(client);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentClient({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/clients', currentClient);
            } else {
                await axios.put(`http://localhost:5000/clients/${currentClient.ClientID}`, currentClient);
            }
            fetchClients();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (clientId) => {
        try {
            await axios.delete(`http://localhost:5000/clients/${clientId}`);
            fetchClients();
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
        setCurrentClient((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация клиентов
    const filteredClients = clients.filter(client => {
        return (
            (filter.FullName ? client.FullName.toLowerCase().includes(filter.FullName.toLowerCase()) : true) &&
            (filter.Phone ? client.Phone.toString().includes(filter.Phone) : true) &&
            (filter.Sex ? client.Sex.toLowerCase() === filter.Sex.toLowerCase() : true)
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Клиентов
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="ФИО"
                    variant="outlined"
                    name="FullName"
                    value={filter.FullName}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="Телефон"
                    variant="outlined"
                    name="Phone"
                    value={filter.Phone}
                    onChange={handleFilterChange}
                />
                <FormControl variant="outlined">
                    <InputLabel>Пол</InputLabel>
                    <Select
                        name="Sex"
                        value={filter.Sex}
                        style={{ width: '200px' }}
                        onChange={handleFilterChange}
                        label="Пол"
                    >
                        <MenuItem value="">
                            <em>Все</em>
                        </MenuItem>
                        <MenuItem value="мужской">Мужской</MenuItem>
                        <MenuItem value="женский">Женский</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Клиента
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>ФИО</TableCell>
                        <TableCell>Дата Рождения</TableCell>
                        <TableCell>Пол</TableCell>
                        <TableCell>Паспорт</TableCell>
                        <TableCell>Телефон</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredClients.map((client) => (
                        <TableRow key={client.ClientID}>
                            <TableCell>{client.ClientID}</TableCell>
                            <TableCell>{client.FullName}</TableCell>
                            <TableCell>{new Date(client.Birthday).toLocaleDateString()}</TableCell>
                            <TableCell>{client.Sex}</TableCell>
                            <TableCell>{client.Passport}</TableCell>
                            <TableCell>{client.Phone}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', client)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(client.ClientID)}>
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

            {/* Диалоговое окно для создания/редактирования клиента */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Клиента' : 'Редактировать Клиента'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о клиенте.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="FullName"
                        label="Полное имя"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentClient.FullName || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Birthday"
                        label="Дата Рождения"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={currentClient.Birthday ? new Date(currentClient.Birthday).toISOString().slice(0, 10) : ''}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth variant="outlined" margin="dense">
                        <InputLabel>Пол</InputLabel>
                        <Select
                            name="Sex"
                            value={currentClient.Sex || ''}
                            onChange={handleChange}
                            label="Пол"
                        >
                            <MenuItem value="мужской">Мужской</MenuItem>
                            <MenuItem value="женский">Женский</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="Passport"
                        label="Паспорт"
                        type={MaskedInput}
                        fullWidth
                        variant="outlined"
                        value={currentClient.Passport || ''}
                        onChange={handleChange}
                        inputComponent={MaskedInput}
                        inputProps={{
                            mask: [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
                        }}
                    />
                    <TextField
                        margin="dense"
                        name="Phone"
                        label="Телефон"
                        type={MaskedInput}
                        fullWidth
                        variant="outlined"
                        value={currentClient.Phone || ''}
                        onChange={handleChange}
                        inputComponent={MaskedInput}
                        inputProps={{
                            inputComponent: MaskedInput,
                            inputProps: {
                                mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
                            }
                            
                        }}
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

export default ClientsTable;


