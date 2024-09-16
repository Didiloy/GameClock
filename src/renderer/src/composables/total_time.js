import {computed, ref} from 'vue'
import {convertMinuteToHoursMinute} from "../common/main";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";

export function useTotalTime() {
    const store = useStore();
    const { sessions } = storeToRefs(store);

    const total_time = ref("");
    const total_time_hours = computed(() => {
        return convertMinuteToHoursMinute(total_time.value);
    });

    function calculateTotalTime() {
        let cpt = 0;
        sessions.value.forEach((element) => {
            cpt += element.duration;
        });
        total_time.value = cpt;
    }

    return {
        total_time_hours,
        calculateTotalTime
    }
}