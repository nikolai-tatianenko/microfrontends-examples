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
