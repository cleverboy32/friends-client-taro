import { reEnum } from '@/utils/enum';

const modules: Record<string, { default: Record<string, unknown> }> = import.meta.glob(
    ['./**/*.ts'],
    {
        eager: true,
    },
);

// 将枚举中的键值反向，方便将值转成描述的键
Object.keys(modules).forEach((key) => {
    if (!modules[key].default) return;
    Object.keys(modules[key].default).forEach((k) => {
        const enumObject = modules[key].default[k];
        if (typeof enumObject === 'object') {
            reEnum(enumObject as Record<string, string | number | [] | boolean>);
        }
    });
});
