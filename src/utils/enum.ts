const symbols = {
    REENUM_FLAG: Symbol('__REENUMED__'),
    REENUM_LIST: Symbol('__REENUM_LIST__'),
};

/** 给enum对象注入反向映射 */
export function reEnum(enumObject: Record<string | symbol, string | number | [] | boolean>) {
    if (enumObject[symbols.REENUM_FLAG]) return enumObject;
    Object.keys(enumObject).forEach((k) => {
        const valKey = enumObject[k];
        if (valKey === k) return;
        if (typeof valKey !== 'string') return;
        if (Object.hasOwn(enumObject, valKey)) {
            console.error(
                `enumObject value ${valKey} is already exists in ${valKey} key, please recheck`,
            );
            return;
        }
        if (!enumObject[symbols.REENUM_LIST]) {
            enumObject[symbols.REENUM_LIST] = [];
        }
        (enumObject[symbols.REENUM_LIST] as string[]).push(valKey);
        enumObject[valKey] = k;
    });
    enumObject[symbols.REENUM_FLAG] = true;
}

/** 将一个enum对象转成下拉选项 */
export function convertEnum2Options(
    enumObject: Record<string | symbol, string | number | [] | boolean>,
) {
    let keys = Object.keys(enumObject).filter(
        (v) => typeof v !== 'number' && !(enumObject[symbols.REENUM_LIST] as string[])?.includes(v),
    );
    return keys.map((v) => ({
        label: v,
        value: enumObject[v],
    }));
}
