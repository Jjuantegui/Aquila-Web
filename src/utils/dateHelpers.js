export const calculateAge = (birthDateString) => {
    if (!birthDateString) return "";

    const [day, month, year] = birthDateString.split('/');
    const birthDate = new Date(year, month - 1, day); // Month is 0-indexed
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};
