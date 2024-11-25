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

const SettledClientsTable = () => {
    const [settledClients, setSettledClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentSettledClient, setCurrentSettledClient] = useState({});
    const [filter, setFilter] = useState({ ClientID: '', SettlingID: '', ClientRate: '' });

    useEffect(() => {
        fetchSettledClients();
    }, []);

    const fetchSettledClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/settled_clients');
            setSettledClients(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, settledClient = {}) => {
        setDialogMode(mode);
        setCurrentSettledClient(settledClient);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentSettledClient({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/settled_clients', currentSettledClient);
            } else {
                await axios.put(`http://localhost:5000/settled_clients/${currentSettledClient.ClientID}`, currentSettledClient);
            }
            fetchSettledClients();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (clientId) => {
        try {
            await axios.delete(`http://localhost:5000/settled_clients/${clientId}`);
            fetchSettledClients();
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
        setCurrentSettledClient((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация клиентов по введенным критериям
    const filteredSettledClients = settledClients.filter(client => {
        return (
            client.ClientID.toString().includes(filter.ClientID) &&
            client.SettlingID.toString().includes(filter.SettlingID) &&
            (filter.ClientRate ? client.ClientRate.toString() === filter.ClientRate : true)
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Заселенных Клиентов
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
                <TextField
                    label="ID Клиента"
                    variant="outlined"
                    name="ClientID"
                    value={filter.ClientID}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="ID Заселения"
                    variant="outlined"
                    name="SettlingID"
                    value={filter.SettlingID}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="Оценка Клиента"
                    variant="outlined"
                    name="ClientRate"
                    type="number"
                    value={filter.ClientRate}
                                        onChange={handleFilterChange}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Клиента
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID Клиента</TableCell>
                        <TableCell>ID Заселения</TableCell>
                        <TableCell>Оценка Клиента</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredSettledClients.map((settledClient) => (
                        <TableRow key={settledClient.ClientID}>
                            <TableCell>{settledClient.ClientID}</TableCell>
                            <TableCell>{settledClient.SettlingID}</TableCell>
                            <TableCell>{settledClient.ClientRate}</TableCell>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <Button variant="outlined" onClick={() => handleOpenDialog('edit', settledClient)}>
                                        Редактировать
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDelete(settledClient.ClientID)}>
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

            {/* Диалоговое окно для создания/редактирования заселенного клиента */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Клиента' : 'Редактировать Клиента'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о заселенном клиенте.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="ClientID"
                        label="ID Клиента"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentSettledClient.ClientID || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="SettlingID"
                        label="ID Заселения"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentSettledClient.SettlingID || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="ClientRate"
                        label="Оценка Клиента"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={currentSettledClient.ClientRate || ''}
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

export default SettledClientsTable;

