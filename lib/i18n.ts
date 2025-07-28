import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
    en: {
        translation: {
            habits: "Habits",
            streaks: "Streaks",
            today: "Today",
            noHabits: "No habits found. Start by adding one!",
            completed: "Completed",
            deleteHabit: "Delete Habit",
            deleteHabitPrompt: 'Do you want to delete "{{habitTitle}}" just for today or for all days?',
            cancel: "Cancel",
            onlyToday: "Only for today",
            forAllDays: "For all days",
            logout: "Logout",
            settings: "Settings",
            theme: "Theme",
            language: "Language",
            light: "Light",
            dark: "Dark",
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            months: [
                "January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"
            ],
            createHabit: "Create a new habit",
            title: "Title",
            description: "Description",
            addHabit: "Add Habit",
            fillAllFields: "Please fill in all fields.",
            mustBeLoggedIn: "You must be logged in to add a habit.",
            habitAdded: "Habit added successfully!",
            repeatDays: "Repeat days",
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
            daysShortAdd: ["M", "T", "W", "T", "F", "S", "S"],
            habitStreaks: "Habit Streaks",
            topStreaks: "Top Streaks",
            current: "Current",
            best: "Best",
            total: "Total",
            streaksTitle: "Habit streaks",
        }
    },
    es: {
        translation: {
            habits: "Hábitos",
            streaks: "Rachas",
            today: "Hoy",
            noHabits: "No se encontraron hábitos. ¡Empezá creando uno!",
            completed: "Completados",
            deleteHabit: "Eliminar hábito",
            deleteHabitPrompt: '¿Querés eliminar "{{habitTitle}}" solo hoy o para todos los días?',
            cancel: "Cancelar",
            onlyToday: "Solo por hoy",
            forAllDays: "Para todos los días",
            logout: "Cerrar sesión",
            settings: "Configuración",
            theme: "Tema",
            language: "Idioma",
            light: "Claro",
            dark: "Oscuro",
            daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
            months: [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ],
            createHabit: "Crear un nuevo hábito",
            title: "Título",
            description: "Descripción",
            addHabit: "Agregar Hábito",
            fillAllFields: "Por favor completá todos los campos.",
            mustBeLoggedIn: "Debes iniciar sesión para agregar un hábito.",
            habitAdded: "¡Hábito agregado exitosamente!",
            repeatDays: "Días de repetición",
            daily: "Diario",
            weekly: "Semanal",
            monthly: "Mensual",
            daysShortAdd: ["L", "M", "M", "J", "V", "S", "D"],
            habitStreaks: "Rachas de hábitos",
            topStreaks: "Mejores rachas",
            current: "Actual",
            best: "Mejor",
            total: "Total",
            streaksTitle: "Rachas de hábitos",
        }
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        lng: "en", // default, lo vas a cambiar desde la UI
        interpolation: { escapeValue: false },
    });

export default i18n;
