module ticketing::ticket {
    use aptos_framework::signer;
    use aptos_framework::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::account;
    
    /// Represents a purchased ticket
    struct Ticket has key, store {
        id: u64,
        owner: address,
        event_id: u64,
        price_octas: u64,
    }
    
    /// Event emitted when someone buys a ticket
    struct TicketPurchasedEvent has copy, drop, store {
        owner: address,
        event_id: u64,
        ticket_id: u64,
        price_octas: u64,
    }
    
    /// Stores all tickets for a user + event handle
    struct TicketStore has key {
        tickets: vector<Ticket>,
        total_tickets: u64,
        purchase_events: event::EventHandle<TicketPurchasedEvent>,
    }
    
    /// Must be called once before minting / buying
    public entry fun init_store(account_signer: &signer) {
        move_to(
            account_signer,
            TicketStore {
                tickets: vector::empty<Ticket>(),
                total_tickets: 0,
                purchase_events: account::new_event_handle<TicketPurchasedEvent>(account_signer),
            }
        );
    }
    
    /// Internal mint logic
    fun mint_ticket_internal(
        buyer: &signer,
        event_id: u64,
        price_octas: u64,
    ) {
        let addr = signer::address_of(buyer);
        let store = borrow_global_mut<TicketStore>(addr);
        let ticket_id = store.total_tickets;
        let ticket = Ticket {
            id: ticket_id,
            owner: addr,
            event_id,
            price_octas,
        };
        vector::push_back(&mut store.tickets, ticket);
        store.total_tickets = ticket_id + 1;
        event::emit_event<TicketPurchasedEvent>(
            &mut store.purchase_events,
            TicketPurchasedEvent {
                owner: addr,
                event_id,
                ticket_id,
                price_octas,
            }
        );
    }
    
    /// Transfer APT to host + mint ticket
    public entry fun buy_ticket_with_payment(
        buyer: &signer,
        event_id: u64,
        price_octas: u64,
        host: address,
    ) acquires TicketStore {
        coin::transfer<AptosCoin>(buyer, host, price_octas);
        mint_ticket_internal(buyer, event_id, price_octas);
    }
    
    /// Check if user already has ticket
    public fun has_ticket_for_event(owner: address, event_id: u64): bool acquires TicketStore {
        if (!exists<TicketStore>(owner)) return false;
        let store = borrow_global<TicketStore>(owner);
        let list = &store.tickets;
        let len = vector::length(list);
        let i = 0;
        while (i < len) {
            let t = vector::borrow(list, i);
            if (t.event_id == event_id) return true;
            i = i + 1;
        };
        false
    }
    
    /// Return total tickets a person owns
    public fun get_ticket_count(owner: address): u64 acquires TicketStore {
        if (!exists<TicketStore>(owner)) return 0;
        let store = borrow_global<TicketStore>(owner);
        store.total_tickets
    }
}