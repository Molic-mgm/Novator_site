export const DEFAULT_CONTACTS = {
    title: "Контакты",
    phone: "+7 (000) 000-00-00",
    email: "info@novator.camp",
    address: "Республика Башкортостан, г. Уфа",
    vkUrl: "https://vk.com/novatorcamp",
    map: {
        lat: 54.7348,
        lng: 55.9579,
        zoom: 11
    }
};

export function mergeContacts(value = {}) {
    return {
        ...DEFAULT_CONTACTS,
        ...(value || {}),
        map: {
            ...DEFAULT_CONTACTS.map,
            ...((value || {}).map || {})
        }
    };
}
