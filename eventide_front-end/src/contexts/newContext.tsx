

// const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         try {
//           const { data } = await api.get('/users/profile');
//           setUser(data);
//         } catch (error) {
//           localStorage.removeItem('accessToken');
//         }
//       }
//       setLoading(false);
//     };
//     fetchProfile();
//   }, []);

//   const login = async (email: string, password: string) => {
//     const { data } = await api.post('/auth/login', { email, password });
//     localStorage.setItem('accessToken', data.accessToken);
//     setUser(data.user);
//   };

//   const register = async (name: string, email: string, password: string) => {
//     const { data } = await api.post('/auth/register', { name, email, password });
//     setUser(data.user);
//   };

//   const logout = async () => {
//     try {
//       await api.post('/auth/logout');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//     localStorage.removeItem('accessToken');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };