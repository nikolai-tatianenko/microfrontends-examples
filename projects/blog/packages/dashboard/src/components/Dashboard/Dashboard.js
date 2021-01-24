import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import Checkbox from 'primevue/checkbox';
import Panel from 'primevue/panel';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Chart from 'primevue/chart';
import ProgressBar from 'primevue/progressbar';

import Card from "../Card/Card.vue";

export default {
  components: {
    ProgressBar,
    Checkbox,
    Panel,
    Dropdown,
    InputText,
    Button,
    Column,
    DataTable,
    Chart,
    Card,
  },
  data () {
    return {
      // Define data properties
      tasks: [
        {
          name: 'reports',
          label: 'Sales Reports',
          completed: false,
          icon: 'pi pi-chart-bar',
        },
        {
          name: 'invoices',
          label: 'Pay Invoices',
          completed: false,
          icon: 'pi pi-dollar',
        },
        {
          name: 'dinner',
          label: 'Dinner with Tony',
          completed: false,
          icon: 'pi pi-user',
        },
        {
          name: 'meeting',
          label: 'Client Meeting',
          completed: false,
          icon: 'pi pi-users',
        },
        {
          name: 'theme',
          label: 'New Theme',
          completed: false,
          icon: 'pi pi-globe',
        },
        {
          name: 'flight',
          label: 'Flight Ticket',
          completed: false,
          icon: 'pi pi-briefcase',
        },
      ],
      dropdownCities: [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' },
      ],
      dropdownCity: null,
      activities: [
        { name: 'Income', count: '$900', progress: 95 },
        { name: 'Tax', count: '$250', progress: 24 },
      ],
      products: null,
      selectedProducts: null,
      lineData: {
        labels: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
        ],

        datasets: [
          {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
          },
          {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
          },
        ],
      },
    };
  },
  methods: {
    formatCurrency (value) {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    },
  },
};
