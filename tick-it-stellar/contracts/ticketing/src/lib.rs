use soroban_sdk::{Address, Env, Vec, Symbol, symbol, Val};

pub struct Ticket {
    pub id: u64,
    pub owner: Address,
    pub event_id: u64,
    pub price: i128,
}

#[derive(Clone)]
pub struct TicketStore {
    pub tickets: Vec<Ticket>,
    pub total_tickets: u64,
}

const TICKET_STORE: Symbol = symbol!("TICKET_STORE");
const TICKET_COUNT: Symbol = symbol!("TICKET_COUNT");
const OWNER_TICKETS: Symbol = symbol!("OWNER_TKTS");

pub fn init(e: Env, owner: Address) {
    if get_store_exists(&e, &owner) {
        panic!("Store already initialized for this address");
    }
    set_store_exists(&e, &owner, true);
}

fn set_store_exists(e: &Env, owner: &Address, exists: bool) {
    let key = (TICKET_STORE.clone(), owner.clone());
    e.persistent_state().set(&key, &exists);
}

fn get_store_exists(e: &Env, owner: &Address) -> bool {
    let key = (TICKET_STORE.clone(), owner.clone());
    e.persistent_state().get(&key).unwrap_or(false)
}

pub fn buy_ticket(
    e: Env,
    buyer: Address,
    host: Address,
    event_id: u64,
    price: i128,
) -> u64 {
    buyer.require_auth();

    if has_ticket_for_event(&e, &buyer, event_id, &host) {
        panic!("Already has a ticket for this event");
    }

    let ticket_id = get_next_ticket_id(&e);
    let ticket = Ticket {
        id: ticket_id,
        owner: buyer.clone(),
        event_id,
        price,
    };

    add_ticket_to_owner(&e, &buyer, ticket.clone());
    increment_ticket_id(&e);

    e.events().emit(
        ("TicketPurchased", buyer, event_id, ticket_id, price),
    );

    ticket_id
}

fn get_next_ticket_id(e: &Env) -> u64 {
    e.persistent_state().get::<_, u64>(&TICKET_COUNT).unwrap_or(0)
}

fn increment_ticket_id(e: &Env) {
    let current = get_next_ticket_id(e);
    e.persistent_state().set(&TICKET_COUNT, &(current + 1));
}

fn add_ticket_to_owner(e: &Env, owner: &Address, ticket: Ticket) {
    let key = (OWNER_TICKETS.clone(), owner.clone());
    let mut tickets = e.persistent_state().get::<_, Vec<Ticket>>(&key).unwrap_or_else(|| Vec::new(e));
    tickets.push_back(ticket);
    e.persistent_state().set(&key, &tickets);
}

pub fn has_ticket_for_event(
    e: &Env,
    owner: &Address,
    event_id: u64,
    host: &Address,
) -> bool {
    let key = (OWNER_TICKETS.clone(), owner.clone());
    if let Some(tickets) = e.persistent_state().get::<_, Vec<Ticket>>(&key) {
        for i in 0..tickets.len() {
            let ticket = tickets.get(i);
            if ticket.event_id == event_id && ticket.owner == *host {
                return true;
            }
        }
    }
    false
}

pub fn get_ticket_count_for_owner(e: &Env, owner: &Address) -> u64 {
    let key = (OWNER_TICKETS.clone(), owner.clone());
    if let Some(tickets) = e.persistent_state().get::<_, Vec<Ticket>>(&key) {
        tickets.len() as u64
    } else {
        0
    }
}

pub fn get_tickets_for_owner(e: &Env, owner: &Address) -> Vec<Ticket> {
    let key = (OWNER_TICKETS.clone(), owner.clone());
    e.persistent_state().get(&key).unwrap_or_else(|| Vec::new(e))
}

pub fn get_event_tickets(e: &Env, event_id: u64, host: &Address) -> Vec<Ticket> {
    let mut result = Vec::new(&e);
    let key = (OWNER_TICKETS.clone(), host.clone());
    
    if let Some(tickets) = e.persistent_state().get::<_, Vec<Ticket>>(&key) {
        for i in 0..tickets.len() {
            let ticket = tickets.get(i);
            if ticket.event_id == event_id {
                result.push_back(ticket);
            }
        }
    }
    result
}
