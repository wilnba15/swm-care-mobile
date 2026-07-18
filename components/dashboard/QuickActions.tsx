import { CalendarPlus, Fuel, Gauge, Wrench } from "lucide-react";
import styles from "./QuickActions.module.css";
const actions=[{label:"Combustible",icon:Fuel},{label:"Kilometraje",icon:Gauge},{label:"Servicio",icon:Wrench},{label:"Agendar",icon:CalendarPlus}];

export function QuickActions(){
  return <section><div className={styles.titleRow}><h2>Accesos rápidos</h2></div>
  <div className={styles.grid}>{actions.map(({label,icon:Icon})=>
    <button className={styles.action} type="button" key={label}><span><Icon size={21}/></span>{label}</button>)}
  </div></section>;
}
