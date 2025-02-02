/**
 * split the object into an array of key-value pairs, 
 * filter out the key-value pairs where the value is undefined, null or ''
 * and convert the array back into an object
 *  */
export function filterDtoEmptyFields(dto: any): any {
    const cleaned =  Object.fromEntries(
        Object.entries(dto).filter(([_, value]) => (value !== undefined && value !== null && value !== ''))
    );
    return cleaned;
}