// CalendarView.tsx
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { SymbolView } from "expo-symbols";
import moment from "moment";
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  CalendarConfig,
  CalendarDate,
  CalendarMode,
  CalendarViewProps,
  CalendarViewRef,
  DateRange,
} from "./Calendar.props";
import { darkTheme } from "./constants";
import { calenderStyles as styles } from "./styles";

const calendarModes: Record<CalendarMode, CalendarConfig> = {
  date: {
    mode: "date",
    title: "Select Date",
    format: "MMMM D, YYYY",
    viewMode: "day",
  },
  month: {
    mode: "month",
    title: "Select Month",
    format: "MMMM YYYY",
    viewMode: "month",
  },
  year: {
    mode: "year",
    title: "Select Year",
    format: "YYYY",
    viewMode: "year",
  },
  "month-year": {
    mode: "month-year",
    title: "Select Month & Year",
    format: "MMMM YYYY",
    viewMode: "month",
  },
  time: {
    mode: "time",
    title: "Select Date & Time",
    format: "MMMM D, YYYY h:mm A",
    viewMode: "day",
  },
};

const CalendarDay = memo<{
  item: CalendarDate;
  onPress: (date: string) => void;
  theme: typeof darkTheme;
  disabled: boolean;
}>(({ item, onPress, theme, disabled }) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress(item.date);
    }
  }, [disabled, onPress, item.date]);

  const dayStyle = useMemo(
    () => [
      styles.dayCell,
      !item.isCurrentMonth && { opacity: 0.3 },
      item.isToday && {
        backgroundColor: theme.info + "20",
        borderWidth: 2,
        borderColor: theme.info,
      },
      item.isSelected && {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
      item.isInRange && { backgroundColor: theme.primary + "30" },
      item.isRangeStart && {
        backgroundColor: theme.primary,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
      },
      item.isRangeEnd && {
        backgroundColor: theme.primary,
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
      },
      disabled && { opacity: 0.4 },
    ],
    [item, theme, disabled],
  );

  const textStyle = useMemo(
    () => [
      styles.dayText,
      { color: theme.foreground },
      !item.isCurrentMonth && { color: theme.mutedForeground },
      item.isToday && { fontWeight: "800", color: theme.info },
      (item.isSelected || item.isRangeStart || item.isRangeEnd) && {
        color: theme.primaryForeground,
        fontWeight: "800",
      },
      item.isInRange &&
        !item.isRangeStart &&
        !item.isRangeEnd && {
          color: theme.foreground,
          fontWeight: "700",
        },
    ],
    [item, theme],
  );

  return (
    <Pressable style={dayStyle} onPress={handlePress} disabled={disabled}>
      <Text style={textStyle as any}>{item.day}</Text>
    </Pressable>
  );
});

const MonthCell = memo<{
  month: string;
  index: number;
  isSelected: boolean;
  onPress: (index: number) => void;
  theme: typeof darkTheme;
}>(({ month, index, isSelected, onPress, theme }) => {
  const handlePress = useCallback(() => onPress(index), [onPress, index]);

  const cellStyle = useMemo(
    () => [
      styles.monthCell,
      { backgroundColor: theme.muted, borderColor: theme.border },
      isSelected && {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    ],
    [isSelected, theme],
  );

  const textStyle = useMemo(
    () => [
      styles.monthText,
      { color: theme.foreground },
      isSelected && { color: theme.primaryForeground, fontWeight: "800" },
    ],
    [isSelected, theme],
  );

  return (
    <Pressable style={cellStyle} onPress={handlePress}>
      <Text style={textStyle as any}>{month}</Text>
    </Pressable>
  );
});

// Memoized Year Cell Component
const YearCell = memo<{
  year: number;
  isSelected: boolean;
  onPress: (year: number) => void;
  theme: typeof darkTheme;
}>(({ year, isSelected, onPress, theme }) => {
  const handlePress = useCallback(() => onPress(year), [onPress, year]);

  const cellStyle = useMemo(
    () => [
      styles.yearCell,
      { backgroundColor: theme.muted, borderColor: theme.border },
      isSelected && {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    ],
    [isSelected, theme],
  );

  const textStyle = useMemo(
    () => [
      styles.yearText,
      { color: theme.foreground },
      isSelected && { color: theme.primaryForeground, fontWeight: "800" },
    ],
    [isSelected, theme],
  );

  return (
    <Pressable style={cellStyle} onPress={handlePress}>
      <Text style={textStyle as any}>{year}</Text>
    </Pressable>
  );
});

const TimePicker = memo<{
  selectedTime: { hour: number; minute: number; period: "AM" | "PM" };
  onTimeChange: (
    type: "hour" | "minute" | "period",
    value: number | string,
  ) => void;
  theme: typeof darkTheme;
}>(({ selectedTime, onTimeChange, theme }) => {
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => [0, 15, 30, 45], []);
  const periods = useMemo(() => ["AM", "PM"] as const, []);

  const renderHourItem = useCallback(
    ({ item }: { item: number }) => (
      <Pressable
        style={[
          styles.timeOption,
          {
            backgroundColor:
              selectedTime.hour === item ? theme.primary : theme.muted,
            borderColor:
              selectedTime.hour === item ? theme.primary : theme.border,
          },
        ]}
        onPress={() => onTimeChange("hour", item)}
      >
        <Text
          style={[
            styles.timeOptionText,
            {
              color:
                selectedTime.hour === item
                  ? theme.primaryForeground
                  : theme.foreground,
            },
          ]}
        >
          {item}
        </Text>
      </Pressable>
    ),
    [selectedTime.hour, onTimeChange, theme],
  );

  const renderMinuteItem = useCallback(
    ({ item }: { item: number }) => (
      <Pressable
        style={[
          styles.timeOption,
          {
            backgroundColor:
              selectedTime.minute === item ? theme.primary : theme.muted,
            borderColor:
              selectedTime.minute === item ? theme.primary : theme.border,
          },
        ]}
        onPress={() => onTimeChange("minute", item)}
      >
        <Text
          style={[
            styles.timeOptionText,
            {
              color:
                selectedTime.minute === item
                  ? theme.primaryForeground
                  : theme.foreground,
            },
          ]}
        >
          {item.toString().padStart(2, "0")}
        </Text>
      </Pressable>
    ),
    [selectedTime.minute, onTimeChange, theme],
  );

  return (
    <Animated.View
      style={[styles.timePickerContainer, { backgroundColor: theme.card }]}
      entering={FadeIn.delay(300)}
    >
      <View style={styles.timePickerHeader}>
        <SymbolView
          name="clock.fill"
          size={22}
          type="hierarchical"
          tintColor={theme.primary}
        />
        <Text style={[styles.timePickerLabel, { color: theme.foreground }]}>
          Select Time
        </Text>
      </View>
      <View style={styles.timePickerRow}>
        {/* Hour picker */}
        <View style={styles.timePicker}>
          <Text
            style={[styles.timePickerTitle, { color: theme.mutedForeground }]}
          >
            Hour
          </Text>
          <FlatList
            data={hours}
            renderItem={renderHourItem}
            keyExtractor={(item) => item.toString()}
            style={styles.timePickerScroll}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={6}
            windowSize={10}
          />
        </View>

        {/* Minute picker */}
        <View style={styles.timePicker}>
          <Text
            style={[styles.timePickerTitle, { color: theme.mutedForeground }]}
          >
            Minute
          </Text>
          <FlatList
            data={minutes}
            renderItem={renderMinuteItem}
            keyExtractor={(item) => item.toString()}
            style={styles.timePickerScroll}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
          />
        </View>

        {/* Period picker */}
        <View style={styles.timePicker}>
          <Text
            style={[styles.timePickerTitle, { color: theme.mutedForeground }]}
          >
            Period
          </Text>
          <View style={styles.timePickerOptions}>
            {periods.map((period) => (
              <Pressable
                key={period}
                style={[
                  styles.timeOption,
                  {
                    backgroundColor:
                      selectedTime.period === period
                        ? theme.primary
                        : theme.muted,
                    borderColor:
                      selectedTime.period === period
                        ? theme.primary
                        : theme.border,
                  },
                ]}
                onPress={() => onTimeChange("period", period)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    {
                      color:
                        selectedTime.period === period
                          ? theme.primaryForeground
                          : theme.foreground,
                    },
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

export const CalendarView = forwardRef<CalendarViewRef, CalendarViewProps>(
  (
    {
      initialDate = moment().format("YYYY-MM-DD"),
      initialMode = "date",
      enableRangeMode = false,
      showModeSelector = true,
      showRangeToggle = true,
      theme: customTheme,
      onDateSelect,
      onRangeSelect,
      onTimeSelect,
      onModeChange,
      dateFormat,
      minDate,
      maxDate,
      disabledDates = [],
      renderTrigger,
      hideTrigger = false,
      sheetSizes = ["auto"],
    },
    ref,
  ) => {
    const theme = useMemo(
      () => ({ ...darkTheme, ...customTheme }),
      [customTheme],
    );

    const [selectedDate, setSelectedDate] = useState<string>(initialDate);
    const [selectedTime, setSelectedTime] = useState({
      hour: 12,
      minute: 0,
      period: "PM" as "AM" | "PM",
    });
    const [dateRange, setDateRange] = useState<DateRange>({
      start: null,
      end: null,
    });
    const [isRangeMode, setIsRangeMode] = useState(enableRangeMode);
    const [calendarMode, setCalendarMode] = useState<CalendarMode>(initialMode);
    const [currentMonth, setCurrentMonth] = useState(moment(initialDate));
    const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");
    const [yearFilter, setYearFilter] = useState("");

    const sheet = useRef<TrueSheet>(null);
    const scrollview = useRef<any>(null);

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.95);

    const isDateDisabled = useCallback(
      (date: string) => {
        if (disabledDates.includes(date)) return true;
        if (minDate && moment(date).isBefore(minDate)) return true;
        if (maxDate && moment(date).isAfter(maxDate)) return true;
        return false;
      },
      [disabledDates, minDate, maxDate],
    );

    const calendarDays = useMemo((): CalendarDate[] => {
      const startOfMonth = currentMonth.clone().startOf("month");
      const endOfMonth = currentMonth.clone().endOf("month");
      const startOfWeek = startOfMonth.clone().startOf("week");
      const endOfWeek = endOfMonth.clone().endOf("week");

      const days: CalendarDate[] = [];
      let day = startOfWeek.clone();

      while (day.isSameOrBefore(endOfWeek, "day")) {
        const dateStr = day.format("YYYY-MM-DD");
        const isInRange =
          isRangeMode &&
          dateRange.start &&
          dateRange.end &&
          day.isBetween(dateRange.start, dateRange.end, "day", "[]");

        days.push({
          date: dateStr,
          day: day.date(),
          isCurrentMonth: day.isSame(currentMonth, "month"),
          isToday: day.isSame(moment(), "day"),
          isSelected: !isRangeMode && dateStr === selectedDate,
          isInRange: isInRange || false,
          isRangeStart: isRangeMode && dateStr === dateRange.start,
          isRangeEnd: isRangeMode && dateStr === dateRange.end,
        });
        day.add(1, "day");
      }

      return days;
    }, [currentMonth, selectedDate, dateRange, isRangeMode]);

    const filteredYears = useMemo(() => {
      const currentYear = moment().year();
      const years = Array.from(
        { length: 201 },
        (_, i) => currentYear - 100 + i,
      );
      if (!yearFilter) return years;
      return years.filter((year) => year.toString().includes(yearFilter));
    }, [yearFilter]);

    const months = useMemo(() => moment.months(), []);

    const showCalendar = useCallback(() => {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });

      const config = calendarModes[calendarMode];
      setViewMode(config.viewMode);
      sheet.current?.present();
    }, [calendarMode]);

    const hideCalendar = useCallback(() => {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(30, { duration: 300 });
      scale.value = withTiming(0.9, { duration: 300 });

      setTimeout(() => {
        sheet.current?.dismiss();
      }, 250);
    }, []);

    const handleDateSelect = useCallback(
      (date: string) => {
        if (isDateDisabled(date)) return;

        if (calendarMode === "date" || calendarMode === "time") {
          if (isRangeMode) {
            if (!dateRange.start || (dateRange.start && dateRange.end)) {
              const newRange = { start: date, end: null };
              setDateRange(newRange);
              onRangeSelect?.(newRange);
            } else {
              const start = moment(dateRange.start);
              const end = moment(date);

              const finalRange = end.isBefore(start)
                ? { start: date, end: dateRange.start }
                : { start: dateRange.start, end: date };

              setDateRange(finalRange);
              onRangeSelect?.(finalRange);
            }
          } else {
            setSelectedDate(date);
            setCurrentMonth(moment(date));
            onDateSelect?.(date);

            if (calendarMode === "date") {
              scale.value = withSequence(
                withTiming(1.05, { duration: 100 }),
                withTiming(1, { duration: 150 }),
              );
              setTimeout(() => hideCalendar(), 200);
            }
          }
        }
      },
      [
        calendarMode,
        isRangeMode,
        dateRange,
        hideCalendar,
        scale,
        onDateSelect,
        onRangeSelect,
        isDateDisabled,
      ],
    );

    const navigateMonth = useCallback((direction: "prev" | "next") => {
      setCurrentMonth((prev) =>
        direction === "prev"
          ? prev.clone().subtract(1, "month")
          : prev.clone().add(1, "month"),
      );
    }, []);

    const handleModeChange = useCallback(
      (mode: CalendarMode) => {
        setCalendarMode(mode);
        onModeChange?.(mode);
        if (mode !== "date") {
          setIsRangeMode(false);
        }
      },
      [onModeChange],
    );

    const handleMonthSelect = useCallback(
      (monthIndex: number) => {
        const newMonth = currentMonth.clone().month(monthIndex);
        setCurrentMonth(newMonth);

        if (calendarMode === "month") {
          setSelectedDate(newMonth.format("YYYY-MM-DD"));
          onDateSelect?.(newMonth.format("YYYY-MM-DD"));
          setTimeout(() => hideCalendar(), 150);
        } else if (calendarMode === "month-year") {
        } else {
          setTimeout(() => setViewMode("day"), 100);
        }
      },
      [currentMonth, calendarMode, hideCalendar, onDateSelect],
    );

    const handleYearSelect = useCallback(
      (year: number) => {
        const newYear = currentMonth.clone().year(year);
        setCurrentMonth(newYear);

        if (calendarMode === "year") {
          setSelectedDate(newYear.format("YYYY-MM-DD"));
          onDateSelect?.(newYear.format("YYYY-MM-DD"));
          setTimeout(() => hideCalendar(), 150);
        } else {
          setTimeout(() => setViewMode("month"), 100);
        }
      },
      [currentMonth, calendarMode, hideCalendar, onDateSelect],
    );

    const handleTimeChange = useCallback(
      (type: "hour" | "minute" | "period", value: number | string) => {
        const newTime = { ...selectedTime, [type]: value };
        setSelectedTime(newTime);
        onTimeSelect?.(newTime);
      },
      [selectedTime, onTimeSelect],
    );

    const goToToday = useCallback(() => {
      const today = moment();

      if (isRangeMode) {
        const newRange = { start: today.format("YYYY-MM-DD"), end: null };
        setDateRange(newRange);
        onRangeSelect?.(newRange);
      } else {
        setSelectedDate(today.format("YYYY-MM-DD"));
        onDateSelect?.(today.format("YYYY-MM-DD"));
      }
      setCurrentMonth(today);
      setViewMode("day");
    }, [isRangeMode, onDateSelect, onRangeSelect]);

    const clearSelection = useCallback(() => {
      if (isRangeMode) {
        const clearedRange = { start: null, end: null };
        setDateRange(clearedRange);
        onRangeSelect?.(clearedRange);
      }
    }, [isRangeMode, onRangeSelect]);

    const resetSelection = useCallback(() => {
      setSelectedDate(initialDate);
      setDateRange({ start: null, end: null });
      setCurrentMonth(moment(initialDate));
      setViewMode("day");
    }, [initialDate]);

    const getValue = useCallback(() => {
      if (isRangeMode) {
        return dateRange;
      }
      return selectedDate;
    }, [isRangeMode, selectedDate, dateRange]);

    const setDateProgrammatically = useCallback(
      (date: string) => {
        setSelectedDate(date);
        setCurrentMonth(moment(date));
        onDateSelect?.(date);
      },
      [onDateSelect],
    );

    const setRangeProgrammatically = useCallback(
      (range: DateRange) => {
        setDateRange(range);
        onRangeSelect?.(range);
      },
      [onRangeSelect],
    );

    useImperativeHandle(
      ref,
      () => ({
        open: showCalendar,
        close: hideCalendar,
        reset: resetSelection,
        goToToday,
        getValue,
        setDate: setDateProgrammatically,
        setRange: setRangeProgrammatically,
      }),
      [
        showCalendar,
        hideCalendar,
        resetSelection,
        goToToday,
        getValue,
        setDateProgrammatically,
        setRangeProgrammatically,
      ],
    );

    const formatSelectedValue = useCallback(() => {
      const config = calendarModes[calendarMode];
      const format = dateFormat || config.format;

      if (isRangeMode && calendarMode === "date" && dateRange.start) {
        const start = moment(dateRange.start).format("MMM D, YYYY");
        const end = dateRange.end
          ? moment(dateRange.end).format("MMM D, YYYY")
          : "Select end date";
        return `${start} — ${end}`;
      }

      switch (calendarMode) {
        case "date":
          return moment(selectedDate).format(format);
        case "month":
          return currentMonth.format(format);
        case "year":
          return currentMonth.format(format);
        case "month-year":
          return currentMonth.format(format);
        case "time":
          const timeStr = `${selectedTime.hour}:${selectedTime.minute.toString().padStart(2, "0")} ${selectedTime.period}`;
          return `${moment(selectedDate).format("MMM D, YYYY")} ${timeStr}`;
        default:
          return moment(selectedDate).format(format);
      }
    }, [
      calendarMode,
      selectedDate,
      currentMonth,
      selectedTime,
      dateRange,
      isRangeMode,
      dateFormat,
    ]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    const getSheetTitle = () => {
      const config = calendarModes[calendarMode];
      return isRangeMode && calendarMode === "date"
        ? "Select Date Range"
        : config.title;
    };

    const renderDayView = useCallback(
      () => (
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={[styles.navButton, { backgroundColor: theme.muted }]}
              onPress={() => navigateMonth("prev")}
            >
              <SymbolView
                name="chevron.left"
                size={20}
                type="hierarchical"
                tintColor={theme.foreground}
              />
            </Pressable>

            <Pressable
              style={[
                styles.monthYearButton,
                { backgroundColor: theme.secondary },
              ]}
              onPress={() => setViewMode("month")}
            >
              <Text style={[styles.monthYearText, { color: theme.foreground }]}>
                {currentMonth.format("MMMM YYYY")}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.navButton, { backgroundColor: theme.muted }]}
              onPress={() => navigateMonth("next")}
            >
              <SymbolView
                name="chevron.right"
                size={20}
                type="hierarchical"
                tintColor={theme.foreground}
              />
            </Pressable>
          </View>

          {/* Days header */}
          <View style={styles.daysHeader}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <Text
                key={day}
                style={[styles.dayHeaderText, { color: theme.mutedForeground }]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((item) => (
              <CalendarDay
                key={item.date}
                item={item}
                onPress={handleDateSelect}
                theme={theme}
                disabled={
                  !item.isCurrentMonth ||
                  (calendarMode !== "date" && calendarMode !== "time") ||
                  isDateDisabled(item.date)
                }
              />
            ))}
          </View>

          {/* Time picker for time mode */}
          {calendarMode === "time" && (
            <TimePicker
              selectedTime={selectedTime}
              onTimeChange={handleTimeChange}
              theme={theme}
            />
          )}
        </View>
      ),
      [
        calendarDays,
        currentMonth,
        navigateMonth,
        setViewMode,
        handleDateSelect,
        theme,
        calendarMode,
        selectedTime,
        handleTimeChange,
        isDateDisabled,
      ],
    );

    const renderMonthView = useCallback(
      () => (
        <View style={styles.viewContainer}>
          <View style={styles.header}>
            <Pressable
              style={[styles.navButton, { backgroundColor: theme.muted }]}
              onPress={() =>
                calendarMode === "month" ? hideCalendar() : setViewMode("day")
              }
            >
              <SymbolView
                name="chevron.left"
                size={20}
                type="hierarchical"
                tintColor={theme.foreground}
              />
            </Pressable>

            <Pressable
              style={[
                styles.monthYearButton,
                { backgroundColor: theme.secondary },
              ]}
              onPress={() =>
                calendarMode !== "month" ? setViewMode("year") : undefined
              }
            >
              <Text style={[styles.monthYearText, { color: theme.foreground }]}>
                {currentMonth.year()}
              </Text>
            </Pressable>

            <View style={styles.navButton} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            <View style={styles.monthGrid}>
              {months.map((month, index) => (
                <MonthCell
                  key={month}
                  month={month}
                  index={index}
                  isSelected={currentMonth.month() === index}
                  onPress={handleMonthSelect}
                  theme={theme}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ),
      [
        months,
        currentMonth,
        handleMonthSelect,
        theme,
        calendarMode,
        hideCalendar,
        setViewMode,
      ],
    );

    const renderYearItem = useCallback(
      ({ item }: { item: number }) => (
        <ScrollView
          ref={scrollview}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          style={{ flex: 1 }}
          nestedScrollEnabled
        >
          <YearCell
            year={item}
            isSelected={currentMonth.year() === item}
            onPress={handleYearSelect}
            theme={theme}
          />
        </ScrollView>
      ),
      [currentMonth, handleYearSelect, theme],
    );

    const getYearItemLayout = useCallback(
      (data: any, index: number) => ({
        length: 76,
        offset: 76 * index,
        index,
      }),
      [],
    );

    const renderYearView = useCallback(
      () => (
        <View style={styles.viewContainer}>
          <View style={styles.header}>
            <Pressable
              style={[styles.navButton, { backgroundColor: theme.muted }]}
              onPress={() =>
                calendarMode === "year" ? hideCalendar() : setViewMode("month")
              }
            >
              <SymbolView
                name="chevron.left"
                size={20}
                type="hierarchical"
                tintColor={theme.foreground}
              />
            </Pressable>

            <Text style={[styles.monthYearText, { color: theme.foreground }]}>
              Select Year
            </Text>

            <View style={styles.navButton} />
          </View>

          {/* Year filter */}
          <View style={styles.filterContainer}>
            <View
              style={[
                styles.searchInputContainer,
                { borderColor: theme.border, backgroundColor: theme.input },
              ]}
            >
              <SymbolView
                name="magnifyingglass"
                size={18}
                type="hierarchical"
                tintColor={theme.mutedForeground}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.filterInput, { color: theme.foreground }]}
                placeholder="Search years..."
                value={yearFilter}
                onChangeText={setYearFilter}
                keyboardType="numeric"
                placeholderTextColor={theme.mutedForeground}
              />
              {yearFilter.length > 0 && (
                <Pressable
                  style={styles.clearIcon}
                  onPress={() => setYearFilter("")}
                >
                  <SymbolView
                    name="xmark.circle.fill"
                    size={18}
                    type="hierarchical"
                    tintColor={theme.mutedForeground}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.yearGridContainer}>
            <FlatList
              scrollEnabled={true}
              data={filteredYears}
              renderItem={renderYearItem}
              keyExtractor={(item) => item.toString()}
              numColumns={3}
              columnWrapperStyle={styles.yearRow}
              contentContainerStyle={styles.yearGridContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={15}
              windowSize={10}
              initialNumToRender={15}
              getItemLayout={getYearItemLayout}
            />
          </View>
        </View>
      ),
      [
        filteredYears,
        renderYearItem,
        getYearItemLayout,
        theme,
        calendarMode,
        hideCalendar,
        setViewMode,
        yearFilter,
      ],
    );

    const renderTriggerContent = () => {
      if (renderTrigger) {
        return renderTrigger({
          selectedValue: formatSelectedValue(),
          onPress: showCalendar,
          isRangeMode,
        });
      }

      return (
        <Pressable
          style={[
            styles.trigger,
            { borderColor: theme.border, backgroundColor: theme.background },
          ]}
          onPress={showCalendar}
        >
          <Text style={[styles.triggerText, { color: theme.foreground }]}>
            {formatSelectedValue()}
          </Text>
          <SymbolView
            name="calendar"
            size={22}
            type="hierarchical"
            tintColor={theme.mutedForeground}
          />
        </Pressable>
      );
    };

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {!hideTrigger && renderTriggerContent()}
        <TrueSheet
          blurTint="systemChromeMaterialDark"
          ref={sheet}
          scrollRef={scrollview}
          sizes={sheetSizes as any}
          cornerRadius={20}
        >
          <Animated.View
            style={[styles.sheet, {}, animatedStyle]}
            entering={FadeIn}
          >
            <Animated.View style={styles.sheetHeader}>
              <View style={styles.sheetTitleContainer}>
                <SymbolView
                  name="calendar.circle.fill"
                  size={24}
                  type="hierarchical"
                  tintColor={theme.primary}
                />
                <Text style={[styles.sheetTitle, { color: theme.foreground }]}>
                  {getSheetTitle()}
                </Text>
              </View>
              <View style={styles.sheetActions}>
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.muted },
                  ]}
                  onPress={goToToday}
                >
                  <SymbolView
                    name="location.fill"
                    size={16}
                    type="hierarchical"
                    tintColor={theme.foreground}
                    style={styles.actionIcon}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: theme.foreground },
                    ]}
                  >
                    Today
                  </Text>
                </Pressable>
                {isRangeMode && (dateRange.start || dateRange.end) && (
                  <Pressable
                    style={[
                      styles.clearButton,
                      {
                        backgroundColor: theme.destructive + "20",
                        borderColor: theme.destructive + "40",
                      },
                    ]}
                    onPress={clearSelection}
                  >
                    <SymbolView
                      name="trash.fill"
                      size={16}
                      type="hierarchical"
                      tintColor={theme.destructive}
                      style={styles.actionIcon}
                    />
                    <Text
                      style={[
                        styles.clearButtonText,
                        { color: theme.destructive },
                      ]}
                    >
                      Clear
                    </Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>

            {/* Mode selector and range toggle */}
            {(showModeSelector || showRangeToggle) && (
              <View style={styles.controlsContainer}>
                {showModeSelector && (
                  <View
                    style={[
                      styles.modeSelector,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.modeSelectorHeader}>
                      <SymbolView
                        name="gear.circle.fill"
                        size={20}
                        type="hierarchical"
                        tintColor={theme.primary}
                      />
                      <Text
                        style={[
                          styles.switchLabel,
                          { color: theme.foreground },
                        ]}
                      >
                        Mode
                      </Text>
                    </View>
                    <View style={styles.modeButtons}>
                      {Object.keys(calendarModes).map((mode) => (
                        <Pressable
                          key={mode}
                          style={[
                            styles.modeButton,
                            {
                              backgroundColor:
                                calendarMode === mode
                                  ? theme.primary
                                  : theme.muted,
                              borderColor:
                                calendarMode === mode
                                  ? theme.primary
                                  : theme.border,
                            },
                          ]}
                          onPress={() => handleModeChange(mode as CalendarMode)}
                        >
                          <Text
                            style={[
                              styles.modeButtonText,
                              {
                                color:
                                  calendarMode === mode
                                    ? theme.primaryForeground
                                    : theme.foreground,
                              },
                            ]}
                          >
                            {calendarModes[mode as CalendarMode].title.replace(
                              "Select ",
                              "",
                            )}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {showRangeToggle && calendarMode === "date" && (
                  <View
                    style={[
                      styles.switchContainer,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.switchLabelContainer}>
                      <SymbolView
                        name="calendar.badge.plus"
                        size={20}
                        type="hierarchical"
                        tintColor={theme.primary}
                      />
                      <Text
                        style={[
                          styles.switchLabel,
                          { color: theme.foreground },
                        ]}
                      >
                        Range Selection
                      </Text>
                    </View>
                    <Switch
                      value={isRangeMode}
                      onValueChange={setIsRangeMode}
                      trackColor={{ false: theme.muted, true: theme.primary }}
                      thumbColor={
                        isRangeMode ? theme.primaryForeground : theme.foreground
                      }
                    />
                  </View>
                )}
              </View>
            )}

            {viewMode === "day" && renderDayView()}
            {viewMode === "month" && renderMonthView()}
            {viewMode === "year" && renderYearView()}
          </Animated.View>
        </TrueSheet>
      </View>
    );
  },
);
