<template>
  <div class="custom-grid custom-fluid custom-dashboard">
    <!-- Custom Card Components -->
    <div class="custom-col-12 custom-lg-4">
      <div class="custom-card custom-summary">
        <span class="custom-title">Users</span>
        <span class="custom-detail">Number of visitors</span>
        <span class="custom-count custom-visitors">12</span>
      </div>
    </div>
    <!-- Repeat the same structure for the remaining cards -->
    <div class="custom-col-12 custom-lg-4">
      <div class="custom-card custom-summary">
        <span class="custom-title">Sales</span>
        <span class="custom-detail">Number of purchases</span>
        <span class="custom-count custom-purchases">534</span>
      </div>
    </div>
    <div class="custom-col-12 custom-lg-4">
      <div class="custom-card custom-summary">
        <span class="custom-title">Revenue</span>
        <span class="custom-detail">Income for today</span>
        <span class="custom-count custom-revenue">$3,200</span>
      </div>
    </div>

    <!-- Custom Highlight Box Components -->
    <div class="custom-col-12 custom-md-6 custom-xl-3">
      <div class="custom-highlight-box">
        <div class="custom-initials custom-highlight-bg-1">
          <span>TV</span>
        </div>
        <div class="custom-highlight-details">
          <i class="pi pi-search"></i>
          <span>Total Queries</span>
          <span class="custom-count">523</span>
        </div>
      </div>
    </div>
    <!-- Repeat the same structure for the remaining highlight boxes -->
    <div class="custom-col-12 custom-md-6 custom-xl-3">
      <div class="custom-highlight-box">
        <div class="custom-initials custom-highlight-bg-2">
          <span>TI</span>
        </div>
        <div class="custom-highlight-details">
          <i class="pi pi-question-circle"></i>
          <span>Total Issues</span>
          <span class="custom-count">81</span>
        </div>
      </div>
    </div>
    <div class="custom-col-12 custom-md-6 custom-xl-3">
      <div class="custom-highlight-box">
        <div class="custom-initials custom-highlight-bg-3">
          <span>OI</span>
        </div>
        <div class="custom-highlight-details">
          <i class="pi pi-filter"></i>
          <span>Open Issues</span>
          <span class="custom-count">21</span>
        </div>
      </div>
    </div>
    <div class="custom-col-12 custom-md-6 custom-xl-3">
      <div class="custom-highlight-box">
        <div class="custom-initials custom-highlight-bg-4">
          <span>CI</span>
        </div>
        <div class="custom-highlight-details">
          <i class="pi pi-check"></i>
          <span>Closed Issues</span>
          <span class="custom-count">60</span>
        </div>
      </div>
    </div>

    <!-- Custom Tasks Panel -->
    <div class="custom-col-12 custom-md-6 custom-lg-4">
      <Panel header="Tasks" style="height: 100%">
        <ul class="custom-task-list">
          <!-- List tasks using v-for directive -->
          <li v-for="(task, index) in tasks" :key="

index">
            <Checkbox v-model="task.completed" :name="task.name"/>
            <span class="custom-task-name">{{ task.label }}</span>
            <i :class="task.icon"></i>
          </li>
        </ul>
      </Panel>
    </div>

    <!-- Custom Contact Form Panel -->
    <div class="custom-col-12 custom-md-6 custom-lg-4 custom-fluid custom-contact-form">
      <Panel header="Contact Us">
        <div class="custom-grid">
          <!-- Input fields and Dropdown component -->
          <div class="custom-col-12">
            <Dropdown
                v-model="dropdownCity"
                :options="dropdownCities"
                optionLabel="name"
                placeholder="Select a City"
            />
          </div>
          <!-- Repeat the same structure for the other input fields -->
          <div class="custom-col-12">
            <!-- Button component for submitting the form -->
            <InputText placeholder="Name" type="text"/>
          </div>
          <div class="custom-col-12">
            <InputText placeholder="Age" type="text"/>
          </div>
          <div class="custom-col-12">
            <InputText placeholder="Message" type="text"/>
          </div>
          <div class="custom-col-12">
            <Button icon="pi pi-envelope" label="Send" type="button"/>
          </div>
        </div>
      </Panel>
    </div>

    <!-- Custom Activity Panel -->
    <div class="custom-col-12 custom-lg-4">
      <Panel header="Activity" style="height: 100%">
        <div class="custom-activity-header">
          <!-- Display last activity details -->
          <div class="custom-grid">
            <div class="custom-col-6">
              <span style="font-weight: bold">Last Activity</span>
              <p>Updated 1 minute ago</p>
            </div>
            <div class="custom-col-6" style="text-align: right">
              <Button icon="pi pi-refresh" label="Refresh"/>
            </div>
          </div>
        </div>
        <h2>Activity List</h2>
        <ul class="custom-activity-list">
          <!-- List activity items using v-for directive -->
          <li v-for="(activity, index) in activities" :key="index">
            <div class="custom-d-flex custom-jc-between custom-ai-center custom-mb-3">
              <h5 class="custom-activity custom-m-0">{{ activity.name }}</h5>
              <div class="custom-count">{{ activity.count }}</div>
            </div>
            <ProgressBar :showValue="false" :value="activity.progress"/>
          </li>
        </ul>
      </Panel>
    </div>

    <!-- Custom Recent Sales Card -->
    <div class="custom-col-12 custom-lg-6">
      <div class="custom-card">
        <h1 style="font-size: 16px">Recent Sales</h1>
        <DataTable
            :paginator="true"
            :rows="5"
            :value="products"
            class="custom-datatable-customers"
            style="margin-bottom: 20px"
        >
          <!-- Define columns using Column component -->
          <Column>
            <template #header> Logo</template>
            <template #body="slotProps">
              <img
                  :alt="slotProps.data.image"
                  :src="'assets/layout/images/product/' + slotProps.data.image"
                  width="50"
              />
            </template>
          </Column>
          <Column :sortable="

true" field="name" header="Name"></Column>
          <Column :sortable="true" field="category" header="Category"></Column>
          <Column :sortable="true" field="price" header="Price">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.price) }}
            </template>
          </Column>
          <Column>
            <template #header> View</template>
            <template #body>
              <Button
                  class="custom-button-success custom-mr-2 custom-mb-1"
                  icon="pi pi-search"
                  type="button"
              ></Button>
              <Button
                  class="custom-button-danger custom-mb-1"
                  icon="pi pi-times"
                  type="button"
              ></Button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Custom Chart Card -->
    <div class="custom-col-12 custom-lg-6">
      <div class="custom-card">
        <Chart :data="lineData" type="line"/>
      </div>
    </div>
  </div>
</template>

<script>
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
</script>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  ::v-deep(.custom-datatable) {
    &.custom-datatable-customers {
      .p-datatable-thead > tr > th,
      .p-datatable-tfoot > tr > td {
        display: none !important;
      }

      .p-datatable-tbody > tr {
        border-bottom: 1px solid #dee2e6;

        > td {
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0 none !important;
          width: 100% !important;
          float: left;
          clear: left;
          border: 0 none;

          .p-column-title {
            padding: 0.4rem;
            min-width: 30%;
            display: inline-block;
            margin: -0.4rem 1rem -0.4rem -0.4rem;
            font-weight: bold;
          }

          .p-progressbar {
            margin-top: 0.5rem;
          }
        }
      }
    }
  }
}

$fontSize: 14px;
$bodyBgColor: #edf0f5;
$textColor: #333333;
$textSecondaryColor: #707070;
$borderRadius: 3px;
$dividerColor: #e3e3e3;
$transitionDuration: 0.2s;
$maskBgColor: #424242;
$focusShadowColor: #8dcdff;

/* Menu Common */
$menuitemBadgeBgColor: #007be5;
$menuitemBadgeColor: #ffffff;
$submenuFontSize: 13px;
$menuitemActiveRouteColor: #1fa1fc;

/* Menu Light */
$menuBgColorFirst: #f3f4f9;
$menuBgColorLast: #d7dbe8;
$menuitemColor: #232428;
$menuitemHoverColor: #0388e5;
$menuitemActiveColor: #0388e5;
$menuitemActiveBgColor: #ffffff;
$menuitemBorderColor: rgba(207, 211, 224, 0.6);

/* Menu Dark */
$menuDarkBgColorFirst: #4d505b;
$menuDarkBgColorLast: #3b3e47;
$menuitemDarkColor: #ffffff;
$menuitemDarkHoverColor: #0388e5;
$menuitemDarkActiveColor: #0388e5;
$menuitemDarkActiveBgColor: #2e3035;
$menuitemDarkBorderColor: rgba(52, 56, 65, 0.6);

/* Topbar */
$topbarLeftBgColor: #0388e5;
$topbarRightBgColor: #07bdf4;
$topbarItemBadgeBgColor: #ef6262;
$topbarItemBadgeColor: #ffffff;
$topbarItemColor: #ffffff;
$topbarItemHoverColor: #c3e8fb;
$topbarSearchInputBorderBottomColor: #ffffff;
$topbarSearchInputColor: #ffffff;

.custom-card {
  background-color: #ffffff;
  padding: 1em;
  margin-bottom: 16px;
  border-radius: $borderRadius;

  &.custom-card-w-title {
    padding-bottom: 2em;
  }
}

.custom-title {
  margin: 1.5rem 0 1rem 0;
  font-family: inherit;
  font-weight: normal;
  line-height: 1.2;
  color: inherit;

  &:first-child {
    margin-top: 0;
  }
}

.custom-h1 {
  font-size: 2.5rem;
}

.custom-h2 {
  font-size: 2rem;
}

.custom-h3 {
  font-size: 1.75rem;
}

.custom-h4 {
  font-size: 1.5rem;
}

.custom-h5 {
  font-size: 1.25rem;
}

.custom-h6 {
  font-size: 1rem;
}

@mixin custom-icon-override($icon) {
  &:before {
    content: $icon;
  }
}

@mixin custom-linear-gradient($top, $bottom) {
  background: $top; /* Old browsers */
  background: linear-gradient(to bottom, $top 0%, $bottom 100%); /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#000000', GradientType=0); /* IE6-9 */
}

@mixin custom-linear-gradient-left($left, $right) {
  background: $left; /* Old browsers */
  background: linear-gradient(to right, $left 0%, $right 100%); /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=$left, endColorstr=$right, GradientType=1); /* IE6-9 */
}

@mixin custom-opacity($opacity) {
  opacity: $opacity;
  $opacity-ie: $opacity * 100;
  filter: alpha(opacity=$opacity-ie);
}

@mixin custom-focused() {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: 0 0 0 0.2em $focusShadowColor;
}

@mixin custom-focused-inset() {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: inset 0 0 0 0.2em $focusShadowColor;
}

@mixin custom-clearfix {
  &:after {
    content: "";
    display: table;
    clear: both;
  }
}

mark {
  background: #fff8e1;
  padding: 0.25rem 0.4rem;
  border-radius: $borderRadius;
  font-family: monospace;
}

blockquote {
  margin: 1rem 0;
  padding: 0 2rem;
  border-left: 4px solid #90a4ae;
}

hr {
  border-top: solid $dividerColor;
  border-width: 1px 0 0 0;
  margin: 1rem 0;
}

p {
  margin: 0 0 1rem 0;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
}

/* Code Highlight */
.docs {
  pre[class*="language-"] {
    padding: 0 !important;
    background: transparent;
    overflow: visible;

    >
    code {
      border-left: 0 none;
      box-shadow: none !important;
      font-size: 14px;
    }
  }
}

/* Footer */
$footerBgColor: #ffffff;
.custom-dashboard {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica,
  Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  background-color: #edf0f5;

  .custom-summary {
    position: relative;

    .custom-title {
      font-size: 20px;
    }

    .custom-detail {
      color: $textSecondaryColor;
      display: block;
      margin-top: 10px;
    }

    .count {
      color: #ffffff;
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 24px;
      padding: 7px 14px;
      border-radius: $borderRadius;

      &.custom-visitors {
        background-color: #20d077;
      }

      &.custom-purchases {
        background-color: #f9c851;
      }

      &.custom-revenue {
        background-color: #007be5;
      }
    }
  }

  .custom-highlight-box {
    height: 100px;
    display: flex;
    @include custom-clearfix();

    .custom-initials {
      height: 100%;
      width: 50%;
      text-align: center;
      padding: 1em;

      > span {
        font-size: 48px;
      }
    }

    .custom-highlight-details {
      height: 100%;
      background-color: #ffffff;
      width: 50%;
      padding: 1em;

      i {
        font-size: 18px;
        vertical-align: middle;
        margin-right: 0.5em;
      }

      .custom-count {
        color: $textSecondaryColor;
        font-size: 36px;
        margin-top: 4px;
        display: block;
      }
    }
  }

  .custom-task-list {
    list-style-type: none;
    margin: 0;
    padding: 0;

    li {
      padding: 0.5em 0.25em;
      border-bottom: 1px solid $dividerColor;
      @include custom-clearfix();
    }

    .custom-checkbox {
      vertical-align: middle;
      margin-right: 0.5em;
    }

    .custom-task-name {
      vertical-align: middle;
    }

    i {
      float: right;
      font-size: 24px;
      color: $textSecondaryColor;
    }

    .custom-panel-content {
      min-height: 256px;
    }
  }

  .custom-contact-form {
    .custom-panel-content {
      min-height: 256px;
    }
  }

  .custom-contacts {
    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;

      li {
        border-bottom: 1px solid $dividerColor;

        button {
          padding: 9px;
          width: 100%;
          box-sizing: border-box;
          text-decoration: none;
          position: relative;
          display: block;
          border-radius: 2px;
          transition: background-color 0.2s;

          .custom-name {
            position: absolute;
            right: 10px;
            top: 10px;
            font-size: 18px;
          }

          .custom-email {
            position: absolute;
            right: 10px;
            top: 30px;
            font

            -size: 14px;
            color: $textSecondaryColor;
          }

          &:hover {
            cursor: pointer;
            background-color: #eeeeee;
          }
        }

        &:last-child {
          border: 0;
        }
      }
    }

    .custom-panel-content {
      min-height: 256px;
    }
  }

  .custom-activity-list {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      border-bottom: 1px solid $dividerColor;
      padding: 16px 8px;

      .custom-count {
        font-size: 24px;
        color: #ffffff;
        background-color: #007be5;
        font-weight: 700;
        padding: 0.25em 0.5em;
        display: inline-block;
        border-radius: $borderRadius;
      }
    }
  }
}
</style>
