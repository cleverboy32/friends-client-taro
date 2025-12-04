/**
 * 日期工具函数
 */

/**
 * 格式化日期为指定格式
 * @param date 日期对象
 * @param format 格式字符串，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
    date: Date,
    format: string = 'YYYY-MM-DD',
): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day);
};

/**
 * 解析日期字符串为 Date 对象
 * @param dateString 日期字符串
 * @returns Date 对象或 null
 */
export const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

/**
 * 判断两个日期是否为同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 是否为同一天
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * 判断日期是否在指定范围内
 * @param date 要检查的日期
 * @param start 开始日期
 * @param end 结束日期
 * @returns 是否在范围内
 */
export const isInRange = (date: Date, start: Date, end: Date): boolean => {
    return date >= start && date <= end;
};

/**
 * 获取指定年月的天数
 * @param year 年份
 * @param month 月份 (0-11)
 * @returns 该月的天数
 */
export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

/**
 * 获取指定年月第一天是星期几
 * @param year 年份
 * @param month 月份 (0-11)
 * @returns 星期几 (0-6, 0 表示星期日)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
};

/**
 * 获取月份的中文名称
 * @param month 月份 (0-11)
 * @returns 月份的中文名称
 */
export const getMonthName = (month: number): string => {
    const months = [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月',
    ];
    return months[month];
};

/**
 * 获取星期的中文名称数组
 * @returns 星期名称数组
 */
export const getWeekDays = (): string[] => {
    return ['日', '一', '二', '三', '四', '五', '六'];
};

/**
 * 获取今天的日期字符串
 * @param format 格式字符串，默认为 'YYYY-MM-DD'
 * @returns 今天的日期字符串
 */
export const getTodayString = (format: string = 'YYYY-MM-DD'): string => {
    return formatDate(new Date(), format);
};

/**
 * 判断日期是否为今天
 * @param date 要检查的日期
 * @returns 是否为今天
 */
export const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
};

/**
 * 获取日期范围的天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数差
 */
export const getDaysDifference = (startDate: Date, endDate: Date): number => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * 添加天数到指定日期
 * @param date 原始日期
 * @param days 要添加的天数
 * @returns 新的日期
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * 添加月份到指定日期
 * @param date 原始日期
 * @param months 要添加的月数
 * @returns 新的日期
 */
export const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

/**
 * 添加年份到指定日期
 * @param date 原始日期
 * @param years 要添加的年数
 * @returns 新的日期
 */
export const addYears = (date: Date, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
};
