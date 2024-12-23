import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';


const DataTableComponent = ({ config }) => {
    const role = localStorage.getItem('role');
    const [data, setData] = useState([]);
    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItem, setNewItem] = useState(config.initialState);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    const token = localStorage.getItem('token');

    const filterss = {
        global: { value: null, matchMode: 'contains' },
        RoomID: { value: null, matchMode: 'contains' },
        FullName: { value: null, matchMode: 'contains' },
        Phone: { value: null, matchMode: 'contains' },
        DateStart: { value: null, matchMode: 'contains' },
        DateEnd: { value: null, matchMode: 'contains' },
        MaidID: { value: null, matchMode: 'contains' },
        DateTime: { value: null, matchMode: 'contains' },
        CleaningState: { value: null, matchMode: 'contains' },
        Position: { value: null, matchMode: 'contains' },
        Birthday: { value: null, matchMode: 'contains' },
        Login: { value: null, matchMode: 'contains' },
        Password: { value: null, matchMode: 'contains' },
        Type: { value: null, matchMode: 'contains' },
        Size: { value: null, matchMode: 'contains' },
        Floor: { value: null, matchMode: 'contains' },
        State: { value: null, matchMode: 'contains' },
        Price: { value: null, matchMode: 'contains' },
        name: { value: null, matchMode: 'contains' },
        Description: { value: null, matchMode: 'contains' },
        ClientID: { value: null, matchMode: 'contains' },
        ClientRate: { value: null, matchMode: 'contains' },
        Name: { value: null, matchMode: 'contains' },
        SettlingID: { value: null, matchMode: 'contains' },
        Amount: { value: null, matchMode: 'contains' },
        SettlingDate: { value: null, matchMode: 'contains' },
        OutDate: { value: null, matchMode: 'contains' },
        Sex: { value: null, matchMode: 'contains' },
        Passport: { value: null, matchMode: 'contains' },
        BookingNumber: { value: null, matchMode: 'contains' },
    }

    const [filters, setFilters] = useState(filterss);


    const filteredData = useMemo(() => {
        return data.filter(item => {
            return config.columns.every(col => {
                if (col.filter) {
                    const filterValue = filters[col.field]?.value?.toLowerCase() || '';
                    if (col.dropdown) {
                        const dropdownValue = col.dropdown.find(option => option.value === item[col.field]);
                        return dropdownValue ? dropdownValue.label.toLowerCase().includes(filterValue) : true;
                    } else {
                        try {
                            return String(item[col.field]).toLowerCase().includes(filterValue);
                        }
                        catch (error) {
                            console.log(error);
                        }
                        return item[col.field].toLowerCase().includes(filterValue);
                    }
                }
                return true; // Если фильтр не установлен, возвращаем true
            });
        });
    }, [data, filters, config.columns]);

    let currentSetting = '';
    if (role === 'Менеджер') {
        currentSetting = 'manager';
    }
    if (role === 'Администратор') {
        currentSetting = 'admin';
    }
    if (role === 'Управляющий'){
        currentSetting = 'control';
    }
    if (role === 'Директор') {
        currentSetting = 'supervisor';
    }
    if (role === 'Горничная') {
        currentSetting = 'maid';
    }

    const filterMatchModeOptions = {
        text: [
            { label: 'Содержит', value: 'contains' },
            { label: 'Начинается с', value: 'startsWith' },
            { label: 'Заканчивается на', value: 'endsWith' },
            { label: 'Равно', value: 'equals' },
            { label: 'Не равно', value: 'notEquals' },
            { label: 'Не содержит', value: 'notContains' },
            { label: 'Без фильтра', value: 'noFilter' }
        ]
    };

    useEffect(() => {
        if (config) {
            setNewItem(config.initialState);
            fetchData();
        }
    }, [config]);

    const fetchData = async () => {
        try {
            const response = await axios.get(config.apiEndpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке данных', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setNewItem(item);
        setIsModalOpenEdit(true);
    };

    const handleDelete = async (item) => {
        try {
            const path = config.edit_key1 ? `${config.apiEndpoint}${item[config.edit_key]}/${item[config.edit_key1]}` : `${config.apiEndpoint}${item[config.edit_key]}`
            await axios.delete(path);
            setData((prevData) => prevData.filter((prevItem) => prevItem[config.edit_key] !== item[config.edit_key]));
            toast.current.show({ severity: 'success', summary: 'Успех', detail: 'Запись удалена', life: 3000 });
            fetchData();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить запись', life: 3000 });
        }
    };

    const handleUpdate = async () => {
        try {
            const updatedItem = { ...newItem }; // Создаем копию объекта newItem
    
            for (const key in updatedItem) {
                if (updatedItem[key] instanceof Date) {
                    updatedItem[key] = updatedItem[key].toISOString(); // Преобразуем Date в строку
                } else if (typeof updatedItem[key] === 'object' && updatedItem[key] !== null) {
                    // Если это вложенный объект, проходим по его ключам
                    for (const nestedKey in updatedItem[key]) {
                        if (updatedItem[key][nestedKey] instanceof Date) {
                            updatedItem[key][nestedKey] = updatedItem[key][nestedKey].toISOString(); // Преобразуем вложенные Date в строку
                        }
                    }
                }
            }
            const path = config.edit_key1 ? `${config.apiEndpoint}${selectedItem[config.edit_key]}/${selectedItem[config.edit_key1]}` : `${config.apiEndpoint}${selectedItem[config.edit_key]}`
            const response = await axios.put(path, updatedItem, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data['error']) {
                toast.current.show({ severity: 'error', summary: 'Ошибка', detail: response.data['error'], life: 3000 });
            } else {
                toast.current.show({ severity: 'success', summary: 'Успех', detail: 'Запись обновлена', life: 3000 });
                if (response.data['msg']){
                    toast.current.show({ severity: 'info', summary: 'Внимание', detail: response.data['msg'], life: 3000 });
                }
                setData((prevData) => prevData.map((item) => (item[config.edit_key] === selectedItem[config.edit_key] ? updatedItem : item)));
                setIsModalOpenEdit(false);
                fetchData();
            }
        } catch (error) {
            console.error("Ошибка при обновлении записи:", error);
            toast.current.show({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить запись', life: 3000 });
        }
    };
    

    const handleAdd = async () => {
        try {
            const response = await axios.post(config.apiEndpoint, newItem);
            if (response.data['error']) {
                toast.current.show({ severity: 'error', summary: 'Ошибка', detail: response.data['error'], life: 3000 });
            }
            else {
                toast.current.show({ severity: 'success', summary: 'Успех', detail: 'Запись добавлена', life: 3000 });
                setData((prevData) => [...prevData, response.data]);
                setIsModalOpenAdd(false);
                setNewItem(config.initialState);
            }
        } catch (error) {
            console.error("Ошибка при добавлении записи:", error);
            toast.current.show({ severity: 'error', summary: 'Ошибка', detail: 'Непредвиденная ошибка', life: 3000 });
        }
    };

    const header = (
        <div>
            <h2>{config.title}</h2>
            {config[currentSetting]['create'] && (
                <Button 
                    label="" 
                    icon="pi pi-plus" 
                    onClick={() => { setIsModalOpenAdd(true); setNewItem(config.initialState); }} 
                    style={{ marginRight: '20px' }} 
                />
            )}
            <span className="p-input-icon-left">
                <InputText
                    type="search"
                    onInput={(e) => setFilters(prevFilters => ({
                        ...prevFilters,
                        global: { value: e.target.value, matchMode: 'contains' }
                    }))}
                    placeholder="Поиск"
                />
            </span>
        </div>
    );

    if (loading) {
        return <div>Загрузка...</div>;
    }
    
    return (
        <>
            <Toast ref={toast} />
            <DataTable
                style={{ padding: '16px', minHeight: 'calc(100vh - 190px)' }}
                value={filteredData}
                showGridlines
                rows={10}
                filters={filters}
                filterDisplay="row"
                header={header}
                emptyMessage="Записи не найдены."
                removableSort
            >
                {config.columns.map((col) => (
                    <Column 
                        key={col.field} 
                        field={col.field} 
                        header={col.header} 
                        sortable={col.sortable} 
                        filter={col.filter}
                        filterMatchModeOptions={filterMatchModeOptions.text}
                        body={col.dropdown ? (rowData) => {
                            const data = col.dropdown.find(option => option.value === rowData[col.field]);
                            return data ? data.label : 'Неизвестный объект';
                        } : null} 
                    /> 
                ))}

                {(config[currentSetting]['edit'] || config[currentSetting]['delete']) && <Column
                    header="Действия"
                    body={(rowData) => (
                        role !== 'фывфыв' ? (
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {
                                config[currentSetting]['edit'] && 
                                <Button label="Редактировать" icon="pi pi-pencil" onClick={() => handleEdit(rowData)} />
                                }

                                {
                                config[currentSetting]['delete'] && config['can_be_deleted'] !== null &&
                                <Button label="Удалить" icon="pi pi-trash" onClick={() => handleDelete(rowData)} />
                                }

                            </div>
                        ) : null
                    )}
                    style={{ minWidth: '8rem' }}
                /> }
            </DataTable>

            <Dialog header="Добавить Запись" visible={isModalOpenAdd} onHide={() => setIsModalOpenAdd(false)}>
                <div>
                    {config.columns.map((col) => (
                        <div key={col.field} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '20px', gap: '20px' }}>
                            <label>{col.header}</label>
                            {col.dropdown ? (
                                <Dropdown 
                                    style={{ width: '236px' }}
                                    value={newItem[col.field]} 
                                    onChange={(e) => setNewItem({ ...newItem, [col.field]: e.value })} // Используйте e.value
                                    options={col.dropdown} 
                                    checkmark={true}  
                                    highlightOnSelect={false} 
                                />
                            ) : (
                                col.type === 'date' ? (
                                    <Calendar
                                        style={{ width: '236px' }}
                                        value={newItem[col.field]}
                                        onChange={(e) => setNewItem({ ...newItem, [col.field]: e.value })}
                                        disabled={col.disabled}
                                        dateFormat="yy-mm-dd"
                                    />
                                ) : col.mask ? (
                                    <InputMask
                                        style={{ width: '236px' }}
                                        value={newItem[col.field]}
                                        onChange={(e) => setNewItem({ ...newItem, [col.field]: e.value })}
                                        disabled={col.disabled}
                                        mask={col.mask}
                                    />
                                
                                ) : (
                                    <InputText
                                        style={{ width: '236px' }}
                                        value={newItem[col.field]}
                                        onChange={(e) => setNewItem({ ...newItem, [col.field]: e.target.value })}
                                        disabled={col.disabled}
                                    />
                                )
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'right', marginTop: '20px', gap: '20px' }}>
                    <Button label="Добавить" icon="pi pi-check" onClick={handleAdd} />
                    <Button label="Отмена" icon="pi pi-times" onClick={() => setIsModalOpenAdd(false)} className="p-button-secondary" />
                </div>
            </Dialog>

            <Dialog header="Редактировать Запись" visible={isModalOpenEdit} onHide={() => setIsModalOpenEdit(false)}>
            <div>
                {config.columns.map((col) => (
                    <div key={col.field} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '20px', gap: '20px' }}>
                        <label>{col.header}</label>
                        {col.dropdown ? (
                            <Dropdown 
                                style={{ width: '236px' }}
                                value={newItem[col.field]}
                                onChange={(e) => setNewItem({ ...newItem, [col.field]: e.value })}
                                options={col.dropdown} 
                                checkmark={true}  
                                highlightOnSelect={false}
                                disabled={col.disabled || (role === 'Горничная' && col.field !== 'CleaningState')} 
                            />
                        ) : (
                            col.type === 'date' ? (
                                <Calendar
                                    style={{ width: '236px' }}
                                    value={newItem[col.field] instanceof Date ? newItem[col.field] : new Date(newItem[col.field])}
                                    onChange={(e) => setNewItem({ ...newItem, [col.field]: e.value })}
                                    disabled={col.disabled || (role === 'Горничная' && col.field !== 'CleaningState')}
                                    dateFormat="yy-mm-dd"
                                />
                            ) : (
                                <InputText
                                    style={{ width: '236px' }}
                                    value={newItem[col.field]}
                                    onChange={(e) => setNewItem({ ...newItem, [col.field]: e.target.value })}
                                    disabled={col.disabled || (role === 'Горничная' && col.field !== 'CleaningState')}
                                />
                            )
                        )}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'right', marginTop: '20px', gap: '20px' }}>
                <Button label="Сохранить" icon="pi pi-check" onClick={handleUpdate} />
                <Button label="Отмена" icon="pi pi-times" onClick={() => setIsModalOpenEdit(false)} className="p-button-secondary" />
            </div>
        </Dialog>

        </>
    );
};

export default DataTableComponent;


   
