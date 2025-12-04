import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    formatDate,
    parseDate,
    isSameDay,
    getDaysInMonth,
    getFirstDayOfMonth,
    getMonthName,
    getWeekDays,
} from '../../utils/date';
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { Popover, PopoverPanel, PopoverButton } from '@headlessui/react';
import { createPortal } from 'react-dom';

// 类型定义
export type DateValue = Date | string | null;
export type DateRange = [DateValue, DateValue];

export interface DatePickerProps {
    value?: DateValue | DateRange;
    defaultValue?: DateValue | DateRange;
    mode?: 'single' | 'range';
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    format?: string;
    minDate?: Date;
    maxDate?: Date;
    onChange?: (value: DateValue | DateRange) => void;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

// 主组件
export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    defaultValue,
    mode = 'single',
    placeholder = '请选择日期',
    disabled = false,
    allowClear = true,
    format = 'YYYY-MM-DD',
    minDate,
    maxDate,
    onChange,
    onOpenChange,
    className = '',
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedValue, setSelectedValue] = useState<DateValue | DateRange>(
        value ?? defaultValue ?? (mode === 'single' ? null : [null, null]),
    );
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // 同步外部 value
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    // 计算面板位置
    const calculatePanelPosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const panelHeight = 320; // 估算面板高度

            let top: number;
            if (spaceBelow >= panelHeight || spaceBelow > spaceAbove) {
                // 显示在下方
                top = rect.bottom + 4;
            } else {
                // 显示在上方
                top = rect.top - panelHeight - 4;
            }

            setPanelPosition({
                top,
                left: rect.left,
            });
        }
    }, []);

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            calculatePanelPosition();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculatePanelPosition]);

    // 获取显示文本
    const getDisplayText = useCallback((): string => {
        if (!selectedValue) return '';

        if (mode === 'single') {
            const singleValue = selectedValue as DateValue;
            if (!singleValue) return '';
            if (typeof singleValue === 'string') return singleValue;
            return formatDate(singleValue, format);
        } else {
            const rangeValue = selectedValue as DateRange;
            if (!rangeValue[0] && !rangeValue[1]) return '';

            const start = rangeValue[0]
                ? typeof rangeValue[0] === 'string'
                    ? rangeValue[0]
                    : formatDate(rangeValue[0], format)
                : '';
            const end = rangeValue[1]
                ? typeof rangeValue[1] === 'string'
                    ? rangeValue[1]
                    : formatDate(rangeValue[1], format)
                : '';

            if (start && end) return `${start} ~ ${end}`;
            return start || end;
        }
    }, [selectedValue, mode, format]);

    // 处理日期选择
    const handleDateSelect = useCallback(
        (date: Date, close?: () => void) => {
            if (disabled) return;
            if (minDate && date < minDate) return;
            if (maxDate && date > maxDate) return;

            if (mode === 'single') {
                const newValue = format === 'YYYY-MM-DD' ? formatDate(date) : date;
                setSelectedValue(newValue);
                onChange?.(newValue);
                // 单日期模式选择后自动关闭
                close?.();
            } else {
                const rangeValue = selectedValue as DateRange;
                const [start, end] = rangeValue;

                let newRange: DateRange;

                if (!start || (start && end)) {
                    newRange = [format === 'YYYY-MM-DD' ? formatDate(date) : date, null];
                } else {
                    const startDate = typeof start === 'string' ? parseDate(start)! : start;
                    if (date < startDate) {
                        newRange = [format === 'YYYY-MM-DD' ? formatDate(date) : date, start];
                    } else {
                        newRange = [start, format === 'YYYY-MM-DD' ? formatDate(date) : date];
                    }
                }

                setSelectedValue(newRange);
                onChange?.(newRange);

                // 范围模式：当两个日期都选择完成后自动关闭
                if (newRange[0] && newRange[1]) {
                    close?.();
                }
            }
        },
        [mode, selectedValue, format, onChange, disabled, minDate, maxDate],
    );

    // 清除选择
    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newValue: DateValue | DateRange = mode === 'single' ? null : [null, null];
            setSelectedValue(newValue);
            onChange?.(newValue);
        },
        [mode, onChange],
    );

    // 月份导航
    const navigateMonth = useCallback((direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    }, []);

    // 渲染日历网格
    const renderCalendarGrid = useCallback(
        (close?: () => void) => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = getDaysInMonth(year, month);
            const firstDayOfMonth = getFirstDayOfMonth(year, month);

            const days: (Date | null)[] = [];

            // 填充上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
                const prevMonth = new Date(
                    year,
                    month - 1,
                    getDaysInMonth(year, month - 1) - firstDayOfMonth + i + 1,
                );
                days.push(prevMonth);
            }

            // 填充当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
                days.push(new Date(year, month, i));
            }

            // 填充下个月的日期
            const remainingDays = 42 - days.length;
            for (let i = 1; i <= remainingDays; i++) {
                days.push(new Date(year, month + 1, i));
            }

            return days.map((date, index) => {
                if (!date)
                    return (
                        <div
                            key={index}
                            className="h-8"
                        />
                    );

                const isCurrentMonth = date.getMonth() === month;
                const isToday = isSameDay(date, new Date());
                const isSelected =
                    mode === 'single'
                        ? (() => {
                              const singleValue = selectedValue as DateValue;
                              if (!singleValue) return false;
                              const selectedDate =
                                  typeof singleValue === 'string'
                                      ? parseDate(singleValue)
                                      : singleValue;
                              return selectedDate ? isSameDay(date, selectedDate) : false;
                          })()
                        : (() => {
                              const rangeValue = selectedValue as DateRange;
                              if (!rangeValue[0] && !rangeValue[1]) return false;

                              const start = rangeValue[0]
                                  ? typeof rangeValue[0] === 'string'
                                      ? parseDate(rangeValue[0])
                                      : rangeValue[0]
                                  : null;
                              const end = rangeValue[1]
                                  ? typeof rangeValue[1] === 'string'
                                      ? parseDate(rangeValue[1])
                                      : rangeValue[1]
                                  : null;

                              if (start && end) {
                                  return (
                                      isSameDay(date, start) ||
                                      isSameDay(date, end) ||
                                      (date >= start && date <= end)
                                  );
                              }
                              return start ? isSameDay(date, start) : false;
                          })();

                const isInHoverRange =
                    mode === 'range' &&
                    hoverDate &&
                    (() => {
                        const rangeValue = selectedValue as DateRange;
                        if (!rangeValue[0]) return false;

                        const start =
                            typeof rangeValue[0] === 'string'
                                ? parseDate(rangeValue[0])
                                : rangeValue[0];
                        if (!start) return false;

                        return (
                            (date >= start && date <= hoverDate) ||
                            (date >= hoverDate && date <= start)
                        );
                    })();

                const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);

                return (
                    <button
                        key={index}
                        className={`
            h-8 w-8 rounded-md text-sm font-medium transition-colors
            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
            ${isToday ? 'bg-primary/10 text-primary' : ''}
            ${isSelected ? 'bg-primary !text-white' : ''}
            ${isInHoverRange && !isSelected ? 'bg-primary/5' : ''}
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:text-dark-primary cursor-pointer'}
          `}
                        onClick={() => !isDisabled && handleDateSelect(date, close)}
                        onMouseEnter={() => !isDisabled && setHoverDate(date)}
                        onMouseLeave={() => setHoverDate(null)}
                        disabled={isDisabled}>
                        {date.getDate()}
                    </button>
                );
            });
        },
        [currentDate, selectedValue, mode, hoverDate, minDate, maxDate, handleDateSelect],
    );

    return (
        <Popover className={`relative inline-block ${className}`}>
            {({ open, close }) => {
                // 同步 open 状态到外部
                useEffect(() => {
                    onOpenChange?.(open);
                }, [open, onOpenChange]);

                return (
                    <>
                        <PopoverButton
                            ref={buttonRef}
                            disabled={disabled}
                            onFocus={calculatePanelPosition}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            className={`
                                relative w-full px-3 py-2  rounded-md shadow-sm
                                bg-white text-sm leading-5 text-left
                                min-w-[200px]
                                ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
                                focus:outline-none 
                            `}>
                            <span className="block truncate">
                                {getDisplayText() || placeholder}
                            </span>

                            {/* 日历图标/清除按钮 */}
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {allowClear && selectedValue && !disabled && isHovering ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear(e);
                                        }}
                                        className="text-gray-400 hover:text-dark-primary transition-colors">
                                        <XCircleIcon className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="text-gray-400">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                            </div>
                        </PopoverButton>

                        {/* 日期选择面板 - 使用 Portal 渲染 */}
                        {open &&
                            createPortal(
                                <PopoverPanel
                                    className="fixed z-2000 bg-white border border-gray-200 rounded-md shadow-lg min-w-[280px]"
                                    style={{
                                        top: `${panelPosition.top}px`,
                                        left: `${panelPosition.left}px`,
                                    }}>
                                    <div className="p-1">
                                        {/* 面板头部 */}
                                        <div className="flex items-center justify-between p-3 border-b border-gray-200">
                                            <button
                                                onClick={() => navigateMonth('prev')}
                                                className="p-1 hover:text-dark-primary ">
                                                <ChevronLeftIcon className="h-4 w-4" />
                                            </button>

                                            <div className="text-sm font-medium">
                                                {currentDate.getFullYear()}年{' '}
                                                {getMonthName(currentDate.getMonth())}
                                            </div>

                                            <button
                                                onClick={() => navigateMonth('next')}
                                                className="p-1 hover:text-dark-primary rounded">
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* 星期标题 */}
                                        <div className="grid grid-cols-7 gap-1 p-2">
                                            {getWeekDays().map((day) => (
                                                <div
                                                    key={day}
                                                    className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* 日历网格 */}
                                        <div className="grid grid-cols-7 gap-1 p-2">
                                            {renderCalendarGrid(close)}
                                        </div>

                                        {/* 面板底部 */}
                                        <div className="p-3 border-t border-gray-200">
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>今天: {formatDate(new Date(), format)}</span>
                                                {mode === 'range' && (
                                                    <span className="text-primary">
                                                        选择范围:{' '}
                                                        {getDisplayText() || '请选择开始日期'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </PopoverPanel>,
                                document.body,
                            )}
                    </>
                );
            }}
        </Popover>
    );
};

export default DatePicker;
