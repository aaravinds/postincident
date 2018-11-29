const qs = require('querystring');
const axios = require('axios');

const menu = {
  items: [
    {
      id: 'CXInvestment',
      name: 'CX Investment',
      options: 'CX',
    },
    {
      id: 'CXInsurance',
      name: 'CX Insurance',
      options: 'CX',
    },
    {
      id: 'Billings',
      name: 'Billing and Payments',
      options: 'CX',
    },
    {
      id: 'registration',
      name: 'CX Registration',
      options: 'CX',
    },
    {
      id: 'cxDocuments',
      name: 'CX Documents',
      options: 'CX',
    },
    {
      id: 'Summary',
      name: 'NMC Summary',
      options: 'NMC',
    },
    {
      id: 'Search',
      name: 'PX Search',
      options: 'NMC',
    },
    {
      id: 'docket',
      name: 'NMC Docket',
      options: 'NMC',
    },
    {
      id: 'Secure share',
      name: 'Secure Share',
      options: 'NMC',
    },
    {
      id: 'CX Login',
      name: 'CX Login',
      options: 'CX',
    },
  ],
  options_group: [
    {
      label: 'NMConnect',
      options: [
        {
          label: 'Search ',
          value: 'NMC Search',
        },
        {
          label: 'Insurance',
          value: 'NMC Insurance',
        },
        {
          label: 'Investment',
          value: 'NMC Investment',
        },
        {
          label: 'Billing&Payments',
          value: 'NMC Billing&Payments',
        },
        {
          label: 'Secure Share',
          value: 'NMC Secure Share',
        },
      ],
    },
    {
      label: 'Client Website',
      options: [
        {
          label: 'Login',
          value: 'CX Login',
        },
        {
          label: 'Accounts',
          value: 'CX Accounts',
        },
        {
          label: 'Insurance',
          value: 'CX Insurance',
        },
        {
          label: 'Investment',
          value: 'CX Investment',
        },
        {
          label: 'Billing&Payments',
          value: 'CX Billing&Payments',
        },
        {
          label: 'Summary',
          value: 'CX Summary',
        },
      ],
    },
    {
      label: 'Choose',
      options: [
        {
          label: 'NMConnect',
          value: 'NMConnect',
        },
        {
          label: 'Client Website',
          value: 'Client Website',
        },
        {
          label: 'Both - NMC/CX',
          value: 'NMC/ClientWebsite',
        },
      ],
    },
  ],Bridge: [
        {
          id: 'Bridge 1',
          name: 'Bridge1',
        },
        {
          id: 'Bridge 2',
          name: 'Bridge2',
        },
        {
          id: 'Bridge 3',
          name: 'Bridge3',
        },
        {
          id: 'Bridge 4',
          name: 'Bridge4',
        },
      ],
     pagerDuty: [
    {
      id: 'EDAS Team',
      name: 'EDAS Team',
    },
    {
      id: 'IPS Team',
      name: 'IPS Team',
    },
    {
      id: 'CRM Team',
      name: 'CRM Team',
    },
    {
      id: 'EDMA Team',
      name: 'EDMS Team',
    },
  ],
  priority:[
    {
      id: 'P1',
      name: 'Priority 1',
    },
    {
      id: 'P2',
      name: 'Priority 2',
    },
    {
      id: 'Hot P2',
      name: 'Hot Priority 2',
    },
  ],
  Application:[
    {
      id: 'NMConnect',
      name: 'NM Connect',
    },
    {
      id: 'ClientWebsite',
      name: 'Client Website',
    },
    {
      id: 'NMC/ClientWebsite',
      name: 'NMC/Client Website',
    },
  ],
  issueType:[
    {
      id: 'intermittent Slowness',
      name: 'intermittent Slowness',
    },
    {
      id: '502 Gateway Error',
      name: '502 Gateway Error',
    },
    {
      id: 'Website is down',
      name: 'Website is down',
    },
    {
      id: 'Login Failure',
      name: 'Login Failure',
    },
    {
      id: 'Failed to load',
      name: 'Failed to load',
    },
    {
      id: 'intermittent Failure',
      name: 'intermittent Failure',
    },
    {
      id: 'Page Cannot be Displayed',
      name: 'Page Cannot be Displayed',
    },
  ],
  listOfApplication() {
    return menu.Application.map(i => ({ label: i.name, value: i.id }));
  },
  listOfScreen1() {
    return menu.options_groups.map(i => ({ label: i.name, value: i.id }));
  },
  listOfTypes() {
    return menu.items.map(i => ({ label: i.name, value: i.id }));
  },
  listOfPriority() {
    return menu.priority.map(i => ({ label: i.name, value: i.id }));
  },
  listOfBridge() {
      return menu.Bridge.map(i => ({ label: i.name, value: i.id }));
  },
  listOfPagerDutyTeam() {
  console.log('Pagerduty',menu.pagerDuty.map(i => ({ label: i.name, value: i.id })));
    return menu.pagerDuty.map(i => ({ label: i.name, value: i.id }));
  },
  listOfIssueType() {
  //console.log('issueType',menu.issueType.map(i => ({ label: i.name, value: i.id })));
    return menu.issueType.map(i => ({ label: i.name, value: i.id }));

  },
  listOfChoicesForOption(optionId) {
    return menu.options.find(o => o.id === optionId).choices
      .map(c => ({ label: c.name, value: c.id }));
  },
  choiceNameForId(optionId, choiceId) {
    const option = menu.options.find(o => o.id === optionId);
    if (option) {
      return option.choices.find(c => c.id === choiceId).name;
    }
    return false;
  },
   listOfChannelList() {
   const body = {token: process.env.SLACK_ACCESS_TOKEN};
    axios.post('https://slack.com/api/conversations.list', qs.stringify(body))
      .then(function(response){
        const channelList = response.data.channels;
        return channelList.map(i => ({ label: i.name, value: i.id }));
      });
  },
};

module.exports = menu;
