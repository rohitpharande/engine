/* eslint-disable @typescript-eslint/no-explicit-any */
/** Copyright (c) 2023, Poozle, all rights reserved. **/

export function convertTicket(data: any, collection_id: string | null) {
  return {
    id: data.number,
    name: data.title,
    collection_id: collection_id ? collection_id : '',
    description: data.body,
    status: data.state,
    created_at: data.created_at,
    updated_at: data.updated_at,
    created_by: data.user.login,
    type: data.pull_request ? 'pull_request' : 'issue',
    assignees: data.assignees.map((ass: any) => ({
      id: ass.id,
      username: ass.login,
    })),
    ticket_url: data.url,
    tags: data.labels.map((lab: any) => ({
      id: lab.id,
      name: lab.name,
    })),
    raw_data: data,
  };
}

export const ticketMappings = {
  name: 'title',
  description: 'body',
  assignees: 'assignees',
  tags: 'label',
  status: 'state',
};
