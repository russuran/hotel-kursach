const fetchRooms = () => {
    return fetch('http://127.0.0.1:5000/list_of_rooms')
        .then(response => response.json());
}

const fetchClients = () => {
    return fetch('http://127.0.0.1:5000/list_of_clients')
        .then(response => response.json());
}

const fetchSettledClients = () => {
    return fetch('http://127.0.0.1:5000/sc_list')
        .then(response => response.json());
}

const fetchServices = () => {
    return fetch('http://127.0.0.1:5000/services_list')
        .then(response => response.json());
}

const fetchMaids = () => {
    return fetch('http://127.0.0.1:5000/list_of_maids')
        .then(response => response.json());
}

export const initializeConfigs = async () => {
    try {
        const roomOptions = await fetchRooms();
        const clientsOptions = await fetchClients();
        const settlingOptions = await fetchSettledClients();
        const servicesOptions = await fetchServices();
        const maidOptions = await fetchMaids();
        console.log(settlingOptions);
        const bookingConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/bookings/',
            columns: [
                { field: 'RoomID', header: 'Комната', sortable: true, filter: true, dropdown: roomOptions },
                { field: 'FullName', header: 'ФИО', sortable: true, filter: true },
                { field: 'Phone', header: 'Номер телефона', sortable: true, filter: true, mask: '+7(999)999-99-99' },
                { field: 'DateStart', header: 'Дата заезда', sortable: true, filter: true, type: 'date' },
                { field: 'DateEnd', header: 'Дата выезда', sortable: true, filter: true, type: 'date' },
            ],
            initialState: {
                RoomID: null,
                FullName: null,
                Phone: null,
                DateStart: null,
                DateEnd: null
            },
            admin: { 'create': true, 'edit': true, 'delete': true },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'can_view': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'BookingID'
        };

        const cleaningScheduleConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/cleaning-schedules/',
            columns: [
                { field: 'RoomID', header: 'Комната', sortable: true, filter: true, dropdown: roomOptions },
                { field: 'MaidID', header: 'Сотрудник', sortable: true, filter: true, dropdown: maidOptions },
                { field: 'DateTime', header: 'Дата', sortable: true, filter: true, type: 'date' },
                { field: 'CleaningState', header: 'Состояние', sortable: true, filter: true, dropdown: [{label: 'Не убрано', value: 'Не убрано'}, {label: 'убрано', value: 'убрано'}] },
                
            ],
            initialState: {
                RoomID: null,
                MaidID: null,
                DateTime: null,
                CleaningState: null
            },
            admin: { 'can_view': false },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'create': true, 'edit': true, 'delete': true },
            maid: { 'create': false, 'edit': true, 'delete': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'CleaningID'
        };

        const maidConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/maids/',
            columns: [
                { field: 'WorkerID', header: 'Работник', sortable: true, filter: true },
                
            ],
            initialState: {
                WorkerID: null
            },
            admin: { 'can_view': false },
            control: { 'create': true, 'edit': true, 'delete': true },
            manager: { 'can_view': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'WorkerID'
        };

        const employeeConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/employees/',
            columns: [
                { field: 'FullName', header: 'ФИО', sortable: true, filter: true },
                { field: 'Position', header: 'Должность', sortable: true, filter: true, dropdown: [{label: 'Директор', value: 'Директор'},
                                                                                                   {label: 'Администратор', value: 'Администратор'}, 
                                                                                                   {label: 'Горничная', value: 'Горничная'},
                                                                                                   {label: 'Управляющий', value: 'Управляющий'}, 
                                                                                                   {label: 'Менеджер', value: 'Менеджер'}] },
                { field: 'Birthday', header: 'Дата рождения', sortable: true, filter: true, type: 'date' },
                { field: 'Login', header: 'Логин', sortable: true, filter: true },
                { field: 'Password', header: 'Пароль', sortable: true, filter: true },
            ],
            initialState: {
                FullName: null,
                Position: null,
                Birthday: null,
                Login: null,
                Password: null
            },
            admin: { 'can_view': false },
            control: { 'create': true, 'edit': true, 'delete': true },
            manager: { 'create': false, 'edit': false, 'delete': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'WorkerID'
        };

        const roomConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/rooms/',
            columns: [
                { field: 'Type', header: 'Тип комнаты', sortable: true, filter: true },
                { field: 'Size', header: 'Размер комнаты', sortable: true, filter: true },
                { field: 'Floor', header: 'Этаж', sortable: true, filter: true },
                { field: 'State', header: 'Состояние комнаты', sortable: true, filter: true, dropdown: [{ value: 'Свободен', label: 'Свободен'}, { value: 'Занят', label: 'Занят' }]},
                { field: 'Price', header: 'Цена комнаты', sortable: true, filter: true },
                
            ],
            initialState: {
                Type: null,
                Size: null,
                Floor: null,
                State: null,
                Price: null
            },
            admin: { 'create': true, 'edit': true, 'delete': true },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'can_view': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'RoomID'
        };

        const serviceConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/services/',
            columns: [
                { field: 'name', header: 'Название услуги', sortable: true, filter: true },
                { field: 'Price', header: 'Цена услуги', sortable: true, filter: true },
                { field: 'Description', header: 'Описание услуги', sortable: true, filter: true },
            ],
            initialState: {
                Name: null,
                Price: null,
                Description: null
            },
            admin: { 'can_view': false },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'create': true, 'edit': true, 'delete': true },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'name'
        };

        const settledClientConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/settled-clients/',
            columns: [
                { field: 'ClientID', header: 'Имя клиента', sortable: true, filter: true, dropdown: clientsOptions },
                { field: 'SettlingID', header: 'Бронирование', sortable: true, filter: true, dropdown: settlingOptions },
                { field: 'ClientRate', header: 'Оценка клиента', sortable: true, filter: true }
                
            ],
            initialState: {
                ClientID: null,
                SettlingID: null,
                ClientRate: null
            },
            admin: { 'create': true, 'edit': true, 'delete': true },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'create': false, 'edit': false, 'delete': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'ClientID',
            edit_key1: 'SettlingID'

        };

        const settlingServiceConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/settling-services/',
            columns: [
                { field: 'Name', header: 'Услуга', sortable: true, filter: true, dropdown: servicesOptions },
                { field: 'SettlingID', header: 'Заселение', sortable: true, filter: true, dropdown: settlingOptions },
                { field: 'Amount', header: 'Количество', sortable: true, filter: true },
                
            ],
            initialState: {
                Name: null,
                SettlingID: null,
                Amount: null
            },
            admin: { 'can_view': false },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'create': true, 'edit': true, 'delete': true },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'Name',
            edit_key1: 'SettlingID'
        };

        const settlingConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/settling/',
            columns: [
                { field: 'RoomID', header: 'Комната', sortable: true, filter: true, dropdown: roomOptions },
                { field: 'SettlingDate', header: 'Дата заселения', sortable: true, filter: true, type: 'date' },
                { field: 'OutDate', header: 'Дата выселения', sortable: true, filter: true, type: 'date' },
                
            ],
            initialState: {
                RoomID: null,
                SettlingDate: null,
                OutDate: null
            },
            admin: { 'create': true, 'edit': true, 'delete': true },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'can_view': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'BookingNumber'
        };

        const clientConfig = {
            apiEndpoint: 'http://127.0.0.1:5000/clients/',
            columns: [
                { field: 'FullName', header: 'Имя клиента', sortable: true, filter: true },
                { field: 'Birthday', header: 'Дата рождения', sortable: true, filter: true, type: 'date' },
                { field: 'Sex', header: 'Пол', sortable: true, filter: true, dropdown: [{label: 'Мужской', value: 'М'}, {label: 'Женский', value: 'Ж'}] },
                { field: 'Passport', header: 'Паспорт', sortable: true, filter: true, mask: '999999' },
                { field: 'Phone', header: 'Телефон', sortable: true, filter: true, mask: '+7 (999) 999-99-99' },
            ],
            initialState: {
                FullName: null,
                Birthday: null,
                Sex: null,
                Passport: null,
                Phone: null
            },
            admin: { 'create': true, 'edit': true, 'delete': true },
            control: { 'create': false, 'edit': false, 'delete': false },
            manager: { 'create': false, 'edit': false, 'delete': false },
            maid: { 'can_view': false },
            supervisor: { 'create': true, 'edit': true, 'delete': true },
            edit_key: 'ClientID'
        };


    return {
        bookingConfig,
        cleaningScheduleConfig,
        maidConfig,
        employeeConfig,
        roomConfig,
        serviceConfig,
        settledClientConfig,
        settlingServiceConfig,
        settlingConfig,
        clientConfig
    };

} catch (error) {
    console.error('Ошибка при инициализации конфигураций:', error);
    return null;
}
};