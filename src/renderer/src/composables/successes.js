import { ref } from "vue";
import { getIdOfTeam } from "../database/database";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import relentless_logo from "../assets/images/successes/relentless.svg";
import patient_logo from "../assets/images/successes/patient.svg";
import enduring_logo from "../assets/images/successes/enduring.svg";
import inexhaustible_logo from "../assets/images/successes/inexhaustible.svg";
import young_gamer_logo from "../assets/images/successes/young_gamer.svg";
import gamer_logo from "../assets/images/successes/gamer.svg";
import passionnate_logo from "../assets/images/successes/passionnate.svg";
import curious_logo from "../assets/images/successes/curious.svg";
import prospector_logo from "../assets/images/successes/prospector.svg";
import scholar_logo from "../assets/images/successes/scholar.svg";
import depressed_logo from "../assets/images/successes/depressed.svg";
import important_person_logo from "../assets/images/successes/important_person.svg";
import thousand_hours_logo from "../assets/images/successes/thousand_hours.svg";
import stinky_logo from "../assets/images/successes/stinky.svg";
import why_playing_logo from "../assets/images/successes/why_playing.svg";

export function useSuccesses() {
  const store = useStore();
  const i18n = useI18n();
  const { teams } = storeToRefs(store);

  const relentless = ref({ unlocked: false, image: "", description: "" });
  const patient = ref({ unlocked: false, image: "", description: "" });
  const enduring = ref({ unlocked: false, image: "", description: "" });
  const inexhaustible = ref({ unlocked: false, image: "", description: "" });
  const young_gamer = ref({ unlocked: false, image: "", description: "" });
  const gamer = ref({ unlocked: false, image: "", description: "" });
  const passionnate = ref({ unlocked: false, image: "", description: "" });
  const curious = ref({ unlocked: false, image: "", description: "" });
  const prospector = ref({ unlocked: false, image: "", description: "" });
  const scholar = ref({ unlocked: false, image: "", description: "" });
  const depressed = ref({ unlocked: false, image: "", description: "" });
  const important_person = ref({ unlocked: false, image: "", description: "" });
  const thousand_hours = ref({ unlocked: false, image: "", description: "" });
  const stinky = ref({ unlocked: false, image: "", description: "" });
  const why_playing = ref({ unlocked: false, image: "", description: "" });

  function calculateSuccesses(
    teamName,
    sessions,
    compute_important_person = true,
  ) {
    const id_of_team = getIdOfTeam(teamName, teams.value);
    if (id_of_team === "") return;

    let bad_session = new Map(); //relentless
    let session_number = 0; //young_gamer, gamer, passionnate
    let different_games = new Set(); //curious
    let bad_session_acc = 0; //depressed
    //important_person
    let duration_total = 0;
    let duration_team = 0;
    let sessions_of_ten_hours = 0; //stinky

    for (const session of sessions) {
      if (session.team.id === id_of_team) {
        //relentless
        if (session.was_cool !== undefined && session.was_cool === false) {
          if (bad_session.has(session.game.id)) {
            bad_session.set(
              session.game.id,
              bad_session.get(session.game.id) + 1,
            );
          } else {
            bad_session.set(session.game.id, 0);
          }
          bad_session_acc++;
        }

        //patient, enduring, inexhaustible
        if (session.duration >= 60 * 8) {
          patient.value.unlocked = true;
          patient.value.image = patient_logo;
          patient.value.description = i18n.t("Successes.descriptions.patient");
        }
        if (session.duration >= 60 * 10) {
          enduring.value.unlocked = true;
          enduring.value.image = enduring_logo;
          enduring.value.description = i18n.t(
            "Successes.descriptions.enduring",
          );
        }
        if (session.duration >= 60 * 12) {
          inexhaustible.value.unlocked = true;
          inexhaustible.value.image = inexhaustible_logo;
          inexhaustible.value.description = i18n.t(
            "Successes.descriptions.inexhaustible",
          );
        }

        session_number++; //young_gamer, gamer, passionnate

        //curious
        different_games.add(session.game.id);

        //important_person
        duration_team += session.duration;
      }
      duration_total += session.duration; //important_person

      if (session.duration >= 60 * 8) { //stinky
        sessions_of_ten_hours++;
      }
    }

    //relentless and why_playing
    for (let [key, value] of bad_session) {
      if (value >= 10) {
        relentless.value.unlocked = true;
        relentless.value.image = relentless_logo;
        relentless.value.description = i18n.t(
          "Successes.descriptions.relentless",
        );
      }
      if (value >= 50) {
        why_playing.value.unlocked = true;
        why_playing.value.image = why_playing_logo;
        why_playing.value.description = i18n.t(
            "Successes.descriptions.why_playing",
        );
      }
    }

    //young_gamer, gamer, passionnate
    if (session_number >= 50) {
      young_gamer.value.unlocked = true;
      young_gamer.value.image = young_gamer_logo;
      young_gamer.value.description = i18n.t(
        "Successes.descriptions.young_gamer",
      );
    }
    if (session_number >= 100) {
      gamer.value.unlocked = true;
      gamer.value.image = gamer_logo;
      gamer.value.description = i18n.t("Successes.descriptions.gamer");
    }
    if (session_number >= 200) {
      passionnate.value.unlocked = true;
      passionnate.value.image = passionnate_logo;
      passionnate.value.description = i18n.t(
        "Successes.descriptions.passionnate",
      );
    }

    //curious, prospector, scholar
    if (different_games.size >= 5) {
      curious.value.unlocked = true;
      curious.value.image = curious_logo;
      curious.value.description = i18n.t("Successes.descriptions.curious");
    }
    if (different_games.size >= 15) {
      prospector.value.unlocked = true;
      prospector.value.image = prospector_logo;
      prospector.value.description = i18n.t(
        "Successes.descriptions.prospector",
      );
    }
    if (different_games.size >= 30) {
      scholar.value.unlocked = true;
      scholar.value.image = scholar_logo;
      scholar.value.description = i18n.t("Successes.descriptions.scholar");
    }

    //depressed
    //get the bad session percentage
    //don't activate the success if there is less than 10 sessions
    if (session_number >= 10) {
      let percentage = (bad_session_acc / session_number) * 100;
      if (percentage >= 40) {
        depressed.value.unlocked = true;
        depressed.value.image = depressed_logo;
        depressed.value.description = i18n.t(
          "Successes.descriptions.depressed",
        );
      }
    }

    //important_person
    //we don't activate the success if there is less than 4 team
    if (compute_important_person) {
      if (teams.value.length >= 4) {
        let percentage_team = (duration_team / duration_total) * 100;
        if (percentage_team >= 30) {
          important_person.value.unlocked = true;
          important_person.value.image = important_person_logo;
          important_person.value.description = i18n.t(
            "Successes.descriptions.important_person",
          );
        }
      }
    }

    //thousand_hours
    if (duration_team >= 1000 * 60) {
      thousand_hours.value.unlocked = true;
      thousand_hours.value.image = thousand_hours_logo;
      thousand_hours.value.description = i18n.t(
        "Successes.descriptions.thousand_hours",
      );
    }

    //stinky
    if (sessions_of_ten_hours >= 50) {
      stinky.value.unlocked = true;
      stinky.value.image = stinky_logo;
      stinky.value.description = i18n.t("Successes.descriptions.stinky");
    }
  }

  return {
    calculateSuccesses,
    relentless,
    patient,
    enduring,
    inexhaustible,
    young_gamer,
    gamer,
    passionnate,
    curious,
    prospector,
    scholar,
    depressed,
    important_person,
    thousand_hours,
    stinky,
    why_playing
  };
}
