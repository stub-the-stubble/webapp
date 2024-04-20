const simpleKebab = (string) => {
    let kebabString = string.replace(/[^a-zA-Z\s+]/g, '');
    kebabString = kebabString.replace(/\s+/g, '-').toLowerCase();

    return kebabString;
};



export { simpleKebab };
