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

const EmployeesTable = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [currentEmployee, setCurrentEmployee] = useState({});
    const [filter, setFilter] = useState({ FullName: '', Position: '', Birthday: '' });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/employees');
            setEmployees(response.data);
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mode, employee = {}) => {
        setDialogMode(mode);
        setCurrentEmployee(employee);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentEmployee({});
    };

    const handleSave = async () => {
        try {
            if (dialogMode === 'create') {
                await axios.post('http://localhost:5000/employees', currentEmployee);
            } else {
                await axios.put(`http://localhost:5000/employees/${currentEmployee.WorkerID}`, currentEmployee);
            }
            fetchEmployees();
            handleCloseDialog();
        } catch (err) {
            setError(err.message);
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async (workerId) => {
        try {
            await axios.delete(`http://localhost:5000/employees/${workerId}`);
            fetchEmployees();
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
        setCurrentEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    // Фильтрация сотрудников по введенным критериям
    const filteredEmployees = employees.filter(employee => {
        return (
            employee.FullName.toLowerCase().includes(filter.FullName.toLowerCase()) &&
            employee.Position.toLowerCase().includes(filter.Position.toLowerCase()) &&
            (filter.Birthday ? new Date(employee.Birthday).toLocaleDateString() === new Date(filter.Birthday).toLocaleDateString() : true)
        );
    });

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" component="div" style={{ padding: '16px' }}>
                Список Сотрудников
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
                    label="Должность"
                    variant="outlined"
                    name="Position"
                    value={filter.Position}
                    onChange={handleFilterChange}
                />
                <TextField
                    label="Дата Рождения"
                    variant="outlined"
                    name="Birthday"
                    type="date"
                    value={filter.Birthday}
                    onChange={handleFilterChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
                Добавить Сотрудника
                </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>ФИО</TableCell>
                        <TableCell>Должность</TableCell>
                        <TableCell>Дата Рождения</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredEmployees.map((employee) => (
                        <TableRow key={employee.WorkerID}>
                            <TableCell>{employee.WorkerID}</TableCell>
                            <TableCell>{employee.FullName}</TableCell>
                            <TableCell>{employee.Position}</TableCell>
                            <TableCell>{new Date(employee.Birthday).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button variant="outlined" onClick={() => handleOpenDialog('edit', employee)}>
                                    Редактировать
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={() => handleDelete(employee.WorkerID)}>
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

            {/* Диалоговое окно для создания/редактирования сотрудника */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{dialogMode === 'create' ? 'Добавить Сотрудника' : 'Редактировать Сотрудника'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Пожалуйста, введите информацию о сотруднике.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="FullName"
                        label="Полное имя"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentEmployee.FullName || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Position"
                        label="Должность"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentEmployee.Position || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Birthday"
                        label="Дата Рождения"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={currentEmployee.Birthday ? new Date(currentEmployee.Birthday).toISOString().slice(0, 10) : ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Login"
                        label="Логин"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentEmployee.Login || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="Password"
                        label="Пароль"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={currentEmployee.Password || ''}
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

export default EmployeesTable;

