import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    customHeader: {
        backgroundColor: '#115566',
        width: '100%',
        paddingHorizontal: 40,
        paddingVertical: 40,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    headerTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#B0BA1D',
    },

    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },

    searchIcon: {
        width: 30,
        height: 30,
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E1E1E',
    },



    // Shelf container
    section: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f7f7fb',
    },

    // Title / Tip
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#222',
        marginBottom: 8,
    },
    tip: {
        color: '#5b5b8a',
        marginBottom: 12,
    },

    // Center / Empty
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 60,
        height: 60,
        marginTop: 16,
    },
    emptyText: {
        fontWeight: '600',
        fontSize: 18,
        marginTop: 8,
        textAlign: 'center',
    },

    // Shelf item
    shelfItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    shelfTitle: {
        fontWeight: '700',
        fontSize: 16,
    },
    shelfAuthor: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },

    // Status pill
    statusPill: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statusOk: {
        backgroundColor: '#10b981',
    },
    statusWarn: {
        backgroundColor: '#f59e0b',
    },
    statusOverdue: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
});
